(function (React$1, ReactDOM, d3, topojson) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$1);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  var jsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

  var useWorldAtlas = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
      d3.json(jsonUrl).then(function (topology) {
        var ref = topology.objects;
        var countries = ref.countries;
        var land = ref.land;
        setData({
          land: topojson.feature(topology, land),
          interiors: topojson.mesh(topology, countries, function (a, b) { return a !== b; }),
        });
      });
    }, []);

    return data;
  };

  var csvUrl =
    "https://gist.githubusercontent.com/curran/a9656d711a8ad31d812b8f9963ac441c/raw/267eac8b97d161c479d950ffad3ddd5ce2d1f370/MissingMigrants-Global-2019-10-08T09-47-14-subset.csv";

  var row = function (d) {
    d.coords = d["Location Coordinates"]
      .split(",")
      .map(function (d) { return +d; })
      .reverse();
    d["Total Dead and Missing"] = +d["Total Dead and Missing"];

    d["Reported Date"] = new Date(d["Reported Date"]);
    return d;
  };

  var useData = function () {
    var ref = React$1.useState(null);
    var data = ref[0];
    var setData = ref[1];

    React$1.useEffect(function () {
      d3.csv(csvUrl, row).then(setData);
    }, []);

    return data;
  };

  var projection = d3.geoNaturalEarth1();
  var path = d3.geoPath(projection);
  var graticule = d3.geoGraticule();

  var Marks$1 = function (ref) {
    var ref_worldAtlas = ref.worldAtlas;
    var land = ref_worldAtlas.land;
    var interiors = ref_worldAtlas.interiors;
    var data = ref.data;
    var sizeScale = ref.sizeScale;
    var sizeValue = ref.sizeValue;

    return (
    React.createElement( 'g', { className: "marks-map" },
      React$1.useMemo(
        function () { return (
          React.createElement( React.Fragment, null,
            React.createElement( 'path', { className: "sphere", d: path({ type: "Sphere" }) }),
            React.createElement( 'path', { className: "graticules", d: path(graticule()) }),
            land.features.map(function (feature) { return (
              React.createElement( 'path', { className: "land", d: path(feature) })
            ); }),
            React.createElement( 'path', { className: "interiors", d: path(interiors) })
          )
        ); },
        [path, graticule, land, interiors]
      ),
      data.map(function (d) {
        var ref = projection(d.coords);
        var x = ref[0];
        var y = ref[1];
        // console.log(projection(d.coords))
        return (
          React.createElement( 'circle', { cx: x, cy: y, r: sizeScale(sizeValue(d)) },
            React.createElement( 'title', null, "missing migrants : " + d["Total Dead and Missing"] )
          )
        );
      })
    )
  );
  };

  var sizeValue = function (d) { return d["Total Dead and Missing"]; };
  var maxRadius = 15;
  var BubbleMap = function (ref) {
    var data = ref.data;
    var worldAtlas = ref.worldAtlas;
    var filteredData = ref.filteredData;

    var sizeScale = React$1.useMemo(
      function () { return d3.scaleSqrt()
          .domain([0, d3.max(data, sizeValue)])
          .range([0, maxRadius]); },
      [data, sizeValue, maxRadius]
    );

    return (
      React__default["default"].createElement( Marks$1, { className: "world", worldAtlas: worldAtlas, data: filteredData, sizeScale: sizeScale, sizeValue: sizeValue })
    );
  };

  var Marks = function (ref) {
    var binnedData = ref.binnedData;
    var yScale = ref.yScale;
    var xScale = ref.xScale;
    var xValue = ref.xValue;
    var yValue = ref.yValue;
    var innerHeight = ref.innerHeight;
    var tooltip = ref.tooltip;

    return (
    React.createElement( 'g', { className: "marks-bar" },
      React.createElement( 'path', {
        fill: "none", stroke: "black", d: d3.line()
          .x(function (d) { return xScale(xValue(d)); })
          .y(function (d) { return yScale(yValue(d)); })
          .curve(d3.curveNatural)(binnedData) }),
      binnedData.map(function (d) { return (
        React.createElement( 'rect', { x: xScale(d.x0), y: yScale(d.y), width: xScale(d.x1) - xScale(d.x0), height: innerHeight - yScale(d.y) },
          React.createElement( 'title', null, tooltip(d.y) )
        )
      ); })
    )
  );
  };

  var AxisBottom = function (ref) {
      var xScale = ref.xScale;
      var height = ref.height;
      var tickFormat = ref.tickFormat;

      return xScale.ticks().map(function (tickValue) { return (
      React.createElement( 'g', { className: "tick", key: tickValue, transform: ("translate(" + (xScale(tickValue)) + ",0)") },
        React.createElement( 'line', { y2: height - 5 }),
        React.createElement( 'text', { style: { textAnchor: "middle" }, y: height - 30 },
          tickFormat(tickValue)
        )
      )
    ); });
  };

  var AxisLeft = function (ref) {
      var yScale = ref.yScale;
      var width = ref.width;

      return yScale.ticks().map(function (tickValue) { return (
      React.createElement( 'g', {
        className: "tick", transform: ("translate(0," + (yScale(
          tickValue
        )) + ")") },
        React.createElement( 'line', { x2: width }), " //y1= ", yScale(tickValue), " y2=", yScale(tickValue),
        React.createElement( 'text', {
          key: tickValue, style: { textAnchor: 'end' }, x: -5, dy: ".32em" },
          tickValue
        )
      )
    ); });
  };

  var margin = {
    top: 0,
    bottom: 50,
    right: 0,
    left: 70,
  };
  var xAxisTickFormat = d3.timeFormat("%m/%Y");
  var xAxisLabel = "Date";

  var yValue = function (d) { return d["Total Dead and Missing"]; };
  var yAxisLabel = "Total Dead and Missing";

  var DateHistogram = function (ref) {
    var data = ref.data;
    var height = ref.height;
    var width = ref.width;
    var setBrushExtent = ref.setBrushExtent;
    var xValue = ref.xValue;

    var brushRef = React$1.useRef();

    var innerHeight = height - margin.top - margin.bottom;
    var innerWidth = width - margin.right - margin.left;

    var xScale = React$1.useMemo(
      function () { return d3.scaleTime().domain(d3.extent(data, xValue)).range([0, innerWidth]); },
      [data, xValue, innerWidth]
    );

    var binnedData = React$1.useMemo(function () {
      var ref = xScale.domain();
      var start = ref[0];
      var stop = ref[1];

      return d3.bin()
        .value(xValue)
        .domain(xScale.domain())
        .thresholds(d3.timeMonths(start, stop))(data)
        .map(function (array) { return ({
          y: d3.sum(array, yValue),
          x0: array.x0,
          x1: array.x1,
        }); });
    }, [xValue, xScale, data, yValue]);
    var yScale = React$1.useMemo(function () {
      // console.log("test")
      return d3.scaleLinear()
        .domain([0, d3.max(binnedData, function (d) { return d.y; })])
        .range([innerHeight, 0])
        .nice();
    }, [binnedData, innerHeight]);
    React$1.useEffect(function () {
      var brush = d3.brushX().extent([
        [0, 0],
        [innerWidth, innerHeight] ]);
      brush(d3.select(brushRef.current));
      brush.on("brush end", function (e) {
        setBrushExtent(e.selection && e.selection.map(xScale.invert));
      });
    }, [innerWidth, innerHeight]);
    return (
      React__default["default"].createElement( React__default["default"].Fragment, null,
        React__default["default"].createElement( 'rect', { width: width, height: height, fill: "none" }),
        React__default["default"].createElement( 'g', { transform: ("translate(" + (margin.left) + "," + (margin.top) + ")") },
          React__default["default"].createElement( 'line', { y2: innerHeight }),
          React__default["default"].createElement( 'line', { y2: innerHeight + 1, y1: innerHeight + 1, x2: innerWidth }),
          React__default["default"].createElement( AxisBottom, { height: height, xScale: xScale, tickFormat: xAxisTickFormat }),
          React__default["default"].createElement( AxisLeft, { yScale: yScale, width: width }),
          React__default["default"].createElement( 'text', { className: "label", textAnchor: "middle", x: innerWidth / 2, y: height },
            " ",
            xAxisLabel
          ),
          React__default["default"].createElement( 'text', { className: "label", textAnchor: "middle", transform: ("translate(" + (-50) + "," + (innerHeight / 2) + ") rotate(-90)") },
            yAxisLabel
          ),
          React__default["default"].createElement( Marks, {
            fill: "#ececec", binnedData: binnedData, xScale: xScale, yScale: yScale, xValue: xValue, yValue: yValue, innerHeight: innerHeight, tooltip: function (d) { return d; } }),
          React__default["default"].createElement( 'g', { ref: brushRef })
        )
      )
    );
  };

  var width = 960;
  var height = 540;
  var DateHistogramSize = 0.4;
  var xValue = function (d) { return d["Reported Date"]; };
  var App = function () {
    var worldAtlas = useWorldAtlas();
    var data = useData();
    var ref = React$1.useState();
    var brushExtent = ref[0];
    var setBrushExtent = ref[1];
    // console.log(brushExtent)
    if (!worldAtlas || !data) {
      return React__default["default"].createElement( 'pre', null, "Loading..." );
    }
    var filteredData = brushExtent
      ? data.filter(function (d) {
          var date = xValue(d);
          return date > brushExtent[0] && date < brushExtent[1];
        })
      : data;
    return (
      React__default["default"].createElement( React__default["default"].Fragment, null,
        React__default["default"].createElement( 'div', { id: "title" },
          React__default["default"].createElement( 'h1', null, "Dead and Missing Migrants [2014-2020]" )
        ),
        React__default["default"].createElement( 'svg', { width: width, height: height },
          React__default["default"].createElement( BubbleMap, { data: data, worldAtlas: worldAtlas, filteredData: filteredData }),
          React__default["default"].createElement( 'g', { transform: ("translate(0," + (height - DateHistogramSize * height) + ")") },
            React__default["default"].createElement( DateHistogram, {
              data: data, height: DateHistogramSize * height, width: width, setBrushExtent: setBrushExtent, xValue: xValue })
          ),
          React__default["default"].createElement( 'g', { className: "copyright", transform: ("translate(" + (width - 35) + "," + (height - 25) + ") ") },
            React__default["default"].createElement( 'text', { textAnchor: "middle", dx: -15, dy: 18 }, "By"),
            React__default["default"].createElement( 'a', { href: "https://thembdev.com" },
              " ",
              React__default["default"].createElement( 'image', { href: "https://mbdev-utils.s3.eu-west-3.amazonaws.com/mbdev_logo_sm.svg", width: 25 })
            )
          )
        )
      )
    );
  };
  var rootElement = document.getElementById("root");
  ReactDOM__default["default"].render(React__default["default"].createElement( App, null ), rootElement);

})(React, ReactDOM, d3, topojson);
//# sourceMappingURL=bundle.js.map
