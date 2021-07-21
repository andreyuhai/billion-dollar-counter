import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

am4core.options.autoDispose = true;
var chart = am4core.create("chartdiv", am4maps.MapChart);
chart.maxZoomLevel = 64;

// Set map definition
chart.geodata = am4geodata_worldLow;

// Set projection
chart.projection = new am4maps.projections.Miller();

// Add button
var zoomOut = chart.tooltipContainer.createChild(am4core.ZoomOutButton);
zoomOut.align = "right";
zoomOut.valign = "top";
zoomOut.margin(20, 20, 20, 20);
zoomOut.events.on("hit", function() {
  if (currentSeries) {
    currentSeries.hide();
  }
  chart.goHome();
  zoomOut.hide();
  currentSeries = worldSeries.series;
  currentSeries.show();
});
zoomOut.hide();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
polygonSeries.calculateVisualCenter = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{name}";
polygonTemplate.fill = chart.colors.getIndex(0);

polygonSeries.exclude = ["AQ"];

var title = chart.titles.create();
title.text = "Live User Map";
title.fontSize = 25;
title.marginBottom = 30;

// Create image series
var imageSeries = chart.series.push(new am4maps.MapImageSeries());

// Create a circle image in image series template so it gets replicated to all new images
var imageSeriesTemplate = imageSeries.mapImages.template;
var circle = imageSeriesTemplate.createChild(am4core.Circle);
circle.radius = 4;
circle.fill = am4core.color("#34B211");
circle.stroke = am4core.color("#FFFFFF");
circle.strokeWidth = 2;
circle.nonScaling = true;
circle.tooltipText = "{title}";

// Set property fields
imageSeriesTemplate.propertyFields.latitude = "latitude";
imageSeriesTemplate.propertyFields.longitude = "longitude";

// Add data for the three cities
imageSeries.data = [];

// Drill-down map


// Creates a series
function createSeries(heatfield) {
  var series = chart.series.push(new am4maps.MapImageSeries());
  series.dataFields.value = heatfield;

  var template = series.mapImages.template;
  template.verticalCenter = "middle";
  template.horizontalCenter = "middle";
  template.propertyFields.latitude = "lat";
  template.propertyFields.longitude = "long";
  template.tooltipText = "{name}:\n[bold]{onlineUsers} online user[/]";

  var circle = template.createChild(am4core.Circle);
  circle.radius = 10;
  circle.fillOpacity = 0.7;
  circle.verticalCenter = "middle";
  circle.horizontalCenter = "middle";
  circle.nonScaling = true;

  var label = template.createChild(am4core.Label);
  label.text = "{onlineUsers}";
  label.fill = am4core.color("#fff");
  label.verticalCenter = "middle";
  label.horizontalCenter = "middle";
  label.nonScaling = true;

  var heat = series.heatRules.push({
    target: circle,
    property: "radius",
    min: 10,
    max: 30
  });

  // Set up drill-down
  series.mapImages.template.events.on("hit", function(ev) {

    // Determine what we've clicked on
    var data = ev.target.dataItem.dataContext;

    // No id? Individual store - nothing to drill down to further
    if (!data.target) {
      return;
    }

    // Create actual series if it hasn't been yet created
    if (!worldSeries[data.target].series) {
      worldSeries[data.target].series = createSeries("count");
      worldSeries[data.target].series.data = data.markerData;
    }

    // Hide current series
    if (currentSeries) {
      currentSeries.hide();
    }

    // Control zoom
    if (data.type == "country") {
      var statePolygon = polygonSeries.getPolygonById(data.country_code);
      chart.zoomToMapObject(statePolygon);
    }
    else if (data.type == "city") {
      chart.zoomToGeoPoint({
        latitude: data.lat,
        longitude: data.long
      }, 64, true);
    }
    zoomOut.show();

    // Show new targert series
    currentSeries = worldSeries[data.target].series;
    console.log("Inside createSeries");
    console.log(currentSeries);
    window.currentSeries = currentSeries;
    currentSeries.show();
  });

  return series;
}

var worldSeries = {};
var currentSeries;

function setupOnlineUsers(data) {

  // Init country-level series
  worldSeries = {
    markerData: [],
    series: createSeries("locations")
  };

  // Set current series
  currentSeries = worldSeries.series;

  console.log("SETUP END")
  window.currentSeries = currentSeries;
  console.log(chart)
  console.log(currentSeries)

  // Process data
  am4core.array.each(data, function(onlineUser) {

    // Get user data
    var onlineUser = {
      long: onlineUser.longitude,
      lat: onlineUser.latitude,
      country_code: onlineUser.country_code,
      country_name: onlineUser.country_name,
      zip: onlineUser.zip,
      city: onlineUser.city
    };

    // Process world-level data
    if (worldSeries[onlineUser.country_code] == undefined) {
      var countryPolygon = polygonSeries.getPolygonById(onlineUser.country_code);
      if (countryPolygon) {

        // Add world data
        worldSeries[onlineUser.country_code] = {
	  country_code: onlineUser.country_code,
          target: onlineUser.country_code,
          type: "country",
          name: countryPolygon.dataItem.dataContext.name,
          onlineUsers: 1,
          lat: countryPolygon.visualLatitude,
          long: countryPolygon.visualLongitude,
          country: onlineUser.country_code,
          markerData: []
        };
	console.log("Here")
	console.log(worldSeries)
        worldSeries.markerData.push(worldSeries[onlineUser.country_code]);
      }
      else {
        // Country not found
        return;
      }
    }
    else {
      worldSeries[onlineUser.country_code].onlineUsers++;
    }

    // Process country-level data
    if (worldSeries[onlineUser.city] == undefined) {
      worldSeries[onlineUser.city] = {
        target: onlineUser.city,
        type: "city",
        name: onlineUser.city,
        onlineUsers: 1,
        lat: onlineUser.lat,
        long: onlineUser.long,
        state: onlineUser.state,
        markerData: []
      };
      worldSeries[onlineUser.country_code].markerData.push(worldSeries[onlineUser.city]);
    }
    else {
      worldSeries[onlineUser.city].onlineUsers++;
    }

    // Process individual onlineUser
    worldSeries[onlineUser.city].markerData.push({
      city: onlineUser.city,
      onlineUsers: 1,
      lat: onlineUser.lat,
      long: onlineUser.long,
      country_code: onlineUser.country_code
    });

  });

  console.log("SETUP END")
  window.currentSeries = currentSeries;
  console.log(chart)
  console.log(currentSeries)
  console.log(worldSeries)
  worldSeries.series.data = worldSeries.markerData;
}

// Drill-down map end

// Hooks
const chartUpdatedHook = {
  mounted() {
    this.handleEvent("update_presence_list", ({presence_list}) => { console.log(presence_list); setupOnlineUsers(presence_list) })
  }
}

export { chartUpdatedHook }
