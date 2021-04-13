// API endpoints 
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonic_queryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Request to get URL for data
d3.json(queryUrl, function(data) {
    console.log(data.features);

    // 
    tectonicPlates(data.features);
});

// Request to get URL for tectonic data
function tectonicPlates(tectonicData) {
    d3.json(tectonic_queryUrl, function(data) {


        createFeatures(tectonicData, data.features);
    });
}

// Color of quake magnitude 
function magColor(magnitude) {
    switch (true) {
        case magnitude >= 5:
            return '#d30000';
        case magnitude >= 4:
            return '#d36200';
        case magnitude >= 3:
            return '#d3a500';
        case magnitude >= 2:
            return '#d3cf00';
        case magnitude >= 1:
            return '#7bd300';
        default:
            return '#1cd300';
    };
};


// Size of quake 
function magSize(magnitude) {
    return magnitude * 25000;
};

// Create Features
function createFeatures(quakeData, dpthData) {

    // Popup to display quake information
    function onFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</p><hr><p>" + "<h3>Magnitude: " + feature.properties.mag + "</h3>")

    };
    //GeoJSON layer containing the features 
    var earthquakes = L.geoJSON(quakeData, {

        onEachFeature: onFeature,

        pointToLayer: function(feature, latlng) {
            return L.circle(latlng, {
                radius: magSize(feature.properties.mag),
                fillColor: magColor(feature.properties.mag),
                fillOpacity: 0.8,
                color: "#000000",
                weight: 0.5
            })
        }

    });

    //GeoJSON layer 
    var faultLines = L.geoJson(dpthData, {
        style: function(feature) {
            var latlngs = (feature.geometry.coordinates);
            return L.polyline(latlngs);
        }
    });

    createMap(earthquakes, faultLines);
};

function createMap(earthquakes, faultLines) {

    // Map layers
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Object to hold map layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    var overlayMaps = {
        Earthquakes: earthquakes,
        FaultLines: faultLines
    };

    // Create a map
    var myMap = L.map("map", {
        center: [15.00, -20.00],
        zoom: 2.5,
        layers: [satellite, grayscale, outdoors, earthquakes, faultLines]
    });

    // Adding layers to map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);


    // Creating the legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            mag_scale = [0, 1, 2, 3, 4, 5];

        // Add a row to the legend
        for (var i = 0; i < mag_scale.length; i++) {

            div.innerHTML +=
                '<i style="background:' + magColor(mag_scale[i]) + '"></i> ' +
                mag_scale[i] + (mag_scale[i + 1] ? '&ndash;' + mag_scale[i + 1] + '<br>' : '+');

        }
        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}