import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_data_countries2 from "@amcharts/amcharts4-geodata/data/countries2";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Use animation, when loading map etc.
am4core.useTheme(am4themes_animated);

var continents = {
  "AF": 0,
  "AN": 1,
  "AS": 2,
  "EU": 3,
  "NA": 4,
  "OC": 5,
  "SA": 6
}

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);

// Set map title
var title = chart.titles.create();
title.text = "Live User Map";
title.fontSize = 25;
title.marginBottom = 30;

// Set map definition
chart.geodata = am4geodata_worldLow;

// Set map projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series for world map
var worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
worldSeries.useGeodata = true;
worldSeries.calculateVisualCenter = true;
worldSeries.exclude = ["AQ"];

// Configure worldSeries polygons
var worldPolygon = worldSeries.mapPolygons.template;
worldPolygon.tooltipText = "{name}";
worldPolygon.fill = am4core.color("#eee");

// Fill worldPolygon on hover
var hs = worldPolygon.states.create("hover");
hs.properties.fill = chart.colors.getIndex(9);

// Create country specific series (but hide it for now)
var countrySeries = chart.series.push(new am4maps.MapPolygonSeries());
countrySeries.useGeodata = true;
countrySeries.hide();
countrySeries.geodataSource.events.on("done", function(ev) {
  worldSeries.hide();
  countrySeries.show();
});

// Configure countrySeries polygons
var countryPolygon = countrySeries.mapPolygons.template;
countryPolygon.tooltipText = "{name}";
countryPolygon.nonScalingStroke = true;
countryPolygon.strokeOpacity = 0.5;
countryPolygon.fill = am4core.color("#eee");

// Fill countryPolygon on hover
var hs = countryPolygon.states.create("hover");
hs.properties.fill = chart.colors.getIndex(9);

// Set up data for countries
var data = [];
for (var id in am4geodata_data_countries2) {
  if (am4geodata_data_countries2.hasOwnProperty(id)) {
    var country = am4geodata_data_countries2[id];
    if (country.maps.length) {
      data.push({
        id: id,
        color: chart.colors.getIndex(continents[country.continent_code]),
        map: country.maps[0]
      });
    }
  }
}

worldSeries.data = data;

// Zoom control
chart.zoomControl = new am4maps.ZoomControl();

var homeButton = new am4core.Button();
homeButton.events.on("hit", function() {
  worldSeries.show();
  countrySeries.hide();

  if (currentSeries) {
    currentSeries.hide();
  }

  if (onlineUserSeries.series) {
    currentSeries = onlineUserSeries.series;
    currentSeries.show();
  }

  chart.titles.values[0].text = "Live User Map"
  chart.goHome();
});

homeButton.icon = new am4core.Sprite();
homeButton.padding(7, 5, 7, 5);
homeButton.width = 30;
homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
homeButton.marginBottom = 10;
homeButton.parent = chart.zoomControl;
homeButton.insertBefore(chart.zoomControl.plusButton);

// Drill-down map
// Creates a series
function createSeries(name) {
  removeSeriesByName(name);
  var series = chart.series.push(new am4maps.MapImageSeries());
  series.name = name;

  var template = series.mapImages.template;
  template.verticalCenter = "middle";
  template.horizontalCenter = "middle";
  template.propertyFields.latitude = "lat";
  template.propertyFields.longitude = "long";
  template.fill = am4core.color("#eee");
  template.tooltipText = "{name}: {onlineUsers} online user";

  var circle = template.createChild(am4core.Circle);
  circle.radius = 10;
  // circle.fillOpacity = 0.7;
  circle.fill = am4core.color("#3EC186");
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

    if (data.type == "country") {
      // Create actual series if it hasn't been yet created
      if (!onlineUserSeries[data.target].series) {
        onlineUserSeries[data.target].series = createSeries(`${data.target}`);
        onlineUserSeries[data.target].series.data = data.markerData;
      }

      // Hide current series
      if (currentSeries) {
        currentSeries.hide();
      }

      // Control zoom
      var countryPolygon = worldSeries.getPolygonById(data.country_code);
      chart.zoomToMapObject(countryPolygon);
      var map = countryPolygon.dataItem.dataContext.map;

      if (map) {
        countryPolygon.isHover = false;
        countrySeries.geodataSource.url = "https://www.amcharts.com/lib/4/geodata/json/" + map + ".json";
        countrySeries.geodataSource.load();
      }

      // Change the chart title
      chart.titles.values[0].text = `${data.name} Live User Map`

      // Show new targert series
      currentSeries = onlineUserSeries[data.target].series;
      window.currentSeries = currentSeries;
      window.chart = chart;
      currentSeries.show();
    }
  });
  return series;
}

var onlineUserSeries = {};
var currentSeries;

function removeSeriesByName(name) {
  if (chart.series.values.find(elem => elem.name == name)) {
    chart.series.removeIndex(
      chart.series.indexOf(chart.series.values.find(elem => elem.name == name))
    ).dispose();
  };
}

function setupOnlineUsers(data) {
  // Init country-level series
  onlineUserSeries = {
    markerData: [],
    series: createSeries("world-level")
  };

  // Set current series
  currentSeries = onlineUserSeries.series;

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
    if (onlineUserSeries[onlineUser.country_code] == undefined) {
      var countryPolygon = worldSeries.getPolygonById(onlineUser.country_code);
      if (countryPolygon) {

        // Add world data
        onlineUserSeries[onlineUser.country_code] = {
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
        onlineUserSeries.markerData.push(onlineUserSeries[onlineUser.country_code]);
      } else {
        // Country not found
        return;
      }
    } else {
      onlineUserSeries[onlineUser.country_code].onlineUsers++;
    }

    // Process country-level data
    if (onlineUserSeries[onlineUser.city] == undefined) {
      onlineUserSeries[onlineUser.city] = {
        target: onlineUser.city,
        type: "city",
        name: onlineUser.city,
        onlineUsers: 1,
        lat: onlineUser.lat,
        long: onlineUser.long,
        state: onlineUser.state,
        markerData: []
      };
      onlineUserSeries[onlineUser.country_code].markerData.push(onlineUserSeries[onlineUser.city]);
    } else {
      onlineUserSeries[onlineUser.city].onlineUsers++;
    }
  });

  console.log("worldSeries after")
  console.log(onlineUserSeries)
  window.currentSeries = currentSeries;
  window.chart = chart;
  window.onlineUserSeries = onlineUserSeries;
  onlineUserSeries.series.data = onlineUserSeries.markerData;
}

// Hooks
const chartUpdatedHook = {
  mounted() {
    this.handleEvent("update_presence_list", ({presence_list}) => { setupOnlineUsers(presence_list) })
  }
}

export { chartUpdatedHook }
