'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['$compile', 'd3', 'queue', 'topojson', 'data', function ($compile, d3, queue, topojson, data) {
        return {
            restrict: 'EA',
            scope: true,
            link: function (scope, element, attr) {
                var width = 1160,
                    height = 690,
                    us_states = false,
                    cms_data = false;

                var projection = d3.geo.albersUsa()
                    .scale(1280)
                    .translate([width / 2, height / 2]);

                var path = d3.geo.path()
                    .projection(projection);

                function initalizeSvg() {
                    d3.select("svg").remove();
                    return d3.select("d3_map").append("svg")
                        .remove()
                        .attr("width", width)
                        .attr("height", height);
                }

                function getDatum(year, enrollment_types, state_full, variable, denominator) {
                    if (!cms_data) {
                        console.error("cms data not loaded");
                        return 0.0;
                    }

                    if (!(state_full in data.state_name_map)) {
                        console.error(state_full + " not found in state map");
                    }

                    var state = data.state_name_map[state_full];

                    if (!(year in cms_data)) {
                        console.error(year + " not found in data");
                        return 0.0;
                    }

                    var output = 0.0;
                    var total_enrolled = 0.0;
                    for (var i = 0; i < enrollment_types.length; i++) {
                        if (!(year in cms_data)) {
                            console.error(year + " not found in data");
                        }

                        if (!(enrollment_types[i] in cms_data[year])) {
                            console.error(enrollment_types[i] + " not found in year " + year);
                        }

                        if (!(state in cms_data[year][enrollment_types[i]])) {
                            console.error(state + "(" + state_full + ") not found in year " + year + " type " + enrollment_types[i]);
                        }

                        if (!(variable in cms_data[year][enrollment_types[i]][state])) {
                            console.error(state + " not found in year " + year + " type " + enrollment_types[i] + " variable " + variable);
                        }

                        output += cms_data[year][enrollment_types[i]][state][variable];
                        if (denominator) {
                            total_enrolled += cms_data[year][enrollment_types[i]][state][denominator];
                        }
                    }

                    if (denominator) {
                        output /= total_enrolled;
                    }

                    return (output);
                }

                function getAllForVariable(year, enrollment_types, variable, denominator) {
                    var states = d3.keys(data.state_name_map);
                    var output = [];
                    for (var i = 0; i < states.length; i++) {
                        output.push(getDatum(year, enrollment_types, states[i], variable, denominator));
                    }
                    return output;
                }

                function getNationalTotal(year, enrollment_types, variable) {
                    var states = d3.keys(data.state_name_map);
                    var output = [];
                    for (var i = 0; i < states.length; i++) {
                        output.push(getDatum(year, enrollment_types, states[i], variable, false));
                    }
                    return d3.sum(output);
                }

                function render(year, variable, selected_enrollment_types, denominator) {
                    if (!scope.$parent.loaded || !cms_data || !us_states) {
                        console.error("Cannot render, data not loaded");
                        return;
                    }

                    var all_values = getAllForVariable(year, selected_enrollment_types, variable, denominator);

                    console.log("Range is " + d3.extent(all_values));

                    var color = d3.scale.linear()
                        .domain(d3.extent(all_values))
                        .range(["#F7FBFF", "#08306B"]);

                    var scale = d3.scale.linear()
                        .domain(d3.extent(all_values))
                        .range([250, 900]);

                    var svg = initalizeSvg();

                    var format;
                    var long_format;
                    var total_format;

                    if (denominator) {
                        if (/dollar/i.test(variable) || /payment/i.test(variable)) {
                            format = d3.format("$.3s");
                            long_format = d3.format("$.3s");
                            total_format = d3.format("$,r")
                        } else if (/admission/i.test(variable) || /days/i.test(variable) || /visits/i.test(variable)) {
                            format = d3.format("4s");
                            long_format = d3.format(".2f");
                            total_format = d3.format(",r");
                        } else {
                            format = d3.format(".2%");
                            long_format = d3.format(".2%");
                            total_format =  d3.format(",r");
                        }
                    } else if (/number/i.test(variable) || /count/i.test(variable)) {
                        format = d3.format("4s");
                        long_format = d3.format(",r");
                        total_format =  d3.format(",r");
                    } else if (/dollar/i.test(variable) || /payment/i.test(variable)) {
                        format = d3.format("$.3s");
                        long_format = d3.format("$,r");
                        total_format =  d3.format("$,r");
                    } else {
                        format = d3.format("");
                        long_format = d3.format(",.2f");
                        total_format =  d3.format(",r");
                    }

                    var xAxis = d3.svg.axis()
                            .scale(scale)
                            .orient("bottom")
                            .tickSize(13)
                            .tickFormat(format);

                    function pair(array) {
                        return array.slice(1).map(function (b, i) {
                            return [array[i], b];
                        });
                    }

                    var legend = svg.append("g")
                        .attr("class", "legend")
                        .attr("transform", "translate(0," + (height - 40) + ")");

                    // legend
                    legend.selectAll("rect")
                        .append("g")
                        .data(pair([d3.min(all_values)].concat(scale.ticks(10)).concat([d3.max(all_values)])))
                        .enter().append("rect")
                        .attr("height", 8)
                        .attr("x", function (d) {
                            return scale(d[0]);
                        })
                        .attr("width", function (d) {
                            return scale(d[1]) - scale(d[0]);
                        })
                        .style("fill", function (d) {
                            return color(d[0]);
                        });

                    // legend
                    legend.call(xAxis)
                        .append("text")
                        .attr("class", "caption")
                        .attr("y", -30)
                        .attr("x", 250)
                        .text(function () {
                            var output;
                            if (denominator) {
                                output = variable + " per " + denominator;
                            } else {
                                output = variable;
                            }

                            return output;
                        });

                    // legend
                    legend.call(xAxis)
                        .append("text")
                        .attr("class", "caption")
                        .attr("y", -12)
                        .attr("x", 250)
                        .text(function () {
                            var output = "National Total: " +
                            total_format(
                                Math.round(getNationalTotal(year, selected_enrollment_types, variable)));

                            return output;
                        });

                    // map
                    svg.append("g")
                        .attr("transform", "translate(0,-50)")
                        .attr("class", "states")
                        .selectAll("path")
                        .data(topojson.feature(us_states, us_states.objects.states).features)
                        .enter()
                        .append("path")
                        .attr("tooltip", function (d) {
                            var out = d.properties.name + " " + variable;
                            var number;
                            if (denominator) {
                                out += " per " + denominator;
                                number = long_format(getDatum(year, selected_enrollment_types,
                                    d.properties.name, variable, denominator));
                            } else {
                                number = long_format(Math.round(getDatum(year, selected_enrollment_types,
                                    d.properties.name, variable, denominator)));
                            }
                            out += ": ";
                            return out + number;
                        })
                        .attr("tooltip-append-to-body", true)
                        .attr("fill", function (d) {
                            return color(getDatum(year, selected_enrollment_types,
                                d.properties.name, variable, denominator));
                        })
                        .attr("d", path);

                    // To avoid infinite digest loop, we insert the raw html into the directive element
                    // then call compile on the contents
                    element.html(svg[0][0].outerHTML);
                    $compile(element.contents())(scope);
                }

                function getEnrollmentTypesAsArray(enrollment_types) {
                    var keys = d3.keys(enrollment_types);
                    var values = d3.values(enrollment_types);
                    var output = [];
                    for (var i = 0; i < values.length; i++) {
                        if (values[i]) {
                            output.push(keys[i]);
                        }
                    }
                    console.log(output);
                    return output;
                }

                function renderFromScope() {
                    render(scope.$parent.year.slice(),
                        scope.$parent.variable.slice(),
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types).slice(),
                        scope.$parent.denominator);
                }

                var watches = ['variable', 'year', 'enrollment_types', 'denominator', 'loaded'];

                for (var i = 0; i < watches.length; i++) {
                    scope.$watch(watches[i],
                        function (newValues, oldValues, scope) {
                            console.log(newValues);
                            console.log(oldValues);
                            renderFromScope();
                        }, true);
                }

                queue()
                    .defer(d3.json, "app/static/us_states.json")
                    .defer(d3.json, "app/static/cms_data.json")
                    .awaitAll(ready);

                function ready(error, data) {
                    if (error) {
                        console.error(error);
                    }
                    us_states = data[0];
                    cms_data = data[1];
                    renderFromScope();
                }
            }
        };
    }]
);

