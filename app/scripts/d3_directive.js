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

                queue()
                    .defer(d3.json, "app/static/us.json")
                    .defer(d3.csv, "app/static/unemployment.tsv", function(d) { rateById.set(d.id, +d.rate); })
                    .await(ready);

                function ready(error, us) {
                    if (error) {
                        console.error(error);
                    }

                    svg.append("g")
                        .attr("class", "counties")
                        .selectAll("path")
                        .data(topojson.feature(us, us.objects.counties).features)
                        .enter().append("path")
                        .attr("class", function(d) { return quantize(rateById.get(d.id)); })
                        .attr("d", path);

                    svg.append("path")
                        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                        .attr("class", "states")
                        .attr("d", path);
                }
            }
        };
    }]
);

