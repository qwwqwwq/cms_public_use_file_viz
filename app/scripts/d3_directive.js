'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['d3', 'queue', 'topojson', function (d3, queue, topojson) {
        return {
            restrict: 'EA',
            scope: true,
            link: function (scope, element, attrs) {
                var width = 960,
                    height = 600;

                var rateById = d3.map();

                var quantize = d3.scale.quantize()
                    .domain([0, .15])
                    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

                var projection = d3.geo.albersUsa()
                    .scale(1280)
                    .translate([width / 2, height / 2]);

                var path = d3.geo.path()
                    .projection(projection);

                var svg = d3.select("d3_map").append("svg")
                    .attr("width", width)
                    .attr("height", height);

                var us_states = undefined;
                var cms_data = undefined;

                queue()
                    .defer(d3.json, "app/static/us_states.json")
                    .defer(d3.json, "app/static/cms_data.json")
                    .await(ready);

                function render() {
                    svg.append("path")
                        .datum(topojson.feature(us_states, us_states).features)
                        .attr("class", function(d) { return quantize(d[scope.variable])})
                        .attr("d", path);
                }

                function ready(error, _us, _cms_data) {
                    if (error) {
                        console.error(error);
                    }
                    us = _us;
                    cms_data = _cms_data;
                    scope.variable_choices = _cms_data.column_names;
                    scope.loaded = true;
                }
            }
        };
    }]
);

