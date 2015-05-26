'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['d3', 'queue', 'topojson', function (d3, queue, topojson) {
        return {
            restrict: 'EA',
            scope: {
                loaded: '=',
                us_states: '=',
                cms_data: '='
            },
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

                function render() {
                    svg.append("path")
                        .datum(topojson.feature(scope.us_states, scope.us_states).features)
                        .attr("class", function(d) {
                            var state = d.properties.name;
                            return quantize(scope.cms_data[state][scope.variable]);
                        })
                        .attr("d", path);
                }
            }
        };
    }]
);

