//define our geojson as a variable and create an earthquake layer group

var EQurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var Platesurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

var earthquakes = L.layerGroup();
var tecPlates = L.layerGroup();

// getting all of the base maps
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: api_key
});

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: api_key
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: api_key
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: api_key
});

// holds all base maps
var allMaps = {
  "Grayscale Map": grayscaleMap,
  "Satellite Map": satelliteMap,
  "Outdoors Map": outdoorsMap,
  "Dark Map": darkMap
};

//holds our overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tecPlates
};

//grayscale map upon load bc i like the gray scale
var myMap = L.map("mapid", {
    center: [0, 0],
    zoom: 2,
    layers: [grayscaleMap, earthquakes]
  });
  
  //creates layer controller, adds in our base and overlay maps
  L.control.layers(allMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  d3.json(EQurl, function(earthquakeData) {
    // creates our marker size by EQ magnitude 
    function markerSize(magnitude) {
      return magnitude * 4;
    };
    // assigns color based on EQ depth
    function chooseColor(depth) {
      switch(true) {
        case depth > 90:
          return "red";
        case depth > 70:
          return "orangered";
        case depth > 50:
          return "orange";
        case depth > 30:
          return "gold";
        case depth > 10:
          return "yellow";
        default:
          return "lightgreen";
      }
    }

  // create a geojson layer containing the features array, popup tells place and time of EQ
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, 
        // Set the style of the markers based on properties.mag
        {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
      );
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
      + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  }).addTo(earthquakes);
  // send EQ data to our map
  earthquakes.addTo(myMap);
  //create layer with our tectonic plate outline
  d3.json(Platesurl, function(data){
    L.geoJSON(data,{
      color: "red",
      weight: 1.5
    }).addTo(tecPlates);

    // send tectonic plate data to our map
    tecPlates.addTo(myMap);
  });

  // add legend
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];
    
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
    // loops through our depth list 
  for (var i =0; i < depth.length; i++) {
    div.innerHTML += 
    '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
    return div;
  };
  legend.addTo(myMap);
});