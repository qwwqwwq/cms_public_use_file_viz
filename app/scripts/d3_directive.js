'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['$compile', 'd3', 'queue', 'topojson', function ($compile, d3, queue, topojson) {
        return {
            restrict: 'EA',
            scope: true,
            link: function (scope, element, attrs) {
                var us_states, cms_data;
                var numerator = 'Number of People';
                var state_name_map =
                {
                    "Alabama":                               "AL",
                    "Alaska":                                "AK",
                    "Arizona":                               "AZ",
                    "Arkansas":                              "AR",
                    "California":                            "CA",
                    "Colorado":                              "CO",
                    "Connecticut":                           "CT",
                    "Delaware":                              "DE",
                    "District of Columbia":                  "DC",
                    "Florida":                                          "FL",
                    "Georgia":                                          "GA",
                    "Hawaii":                                           "HI",
                    "Idaho":                                            "ID",
                    "Illinois":                                         "IL",
                    "Indiana":                                          "IN",
                    "Iowa":                                             "IA",
                    "Kansas":                                           "KS",
                    "Kentucky":                                         "KY",
                    "Louisiana":                                        "LA",
                    "Maine":                                            "ME",
                    "Maryland":                                         "MD",
                    "Massachusetts":                                    "MA",
                    "Michigan":                                         "MI",
                    "Minnesota":                                        "MN",
                    "Mississippi":                                      "MS",
                    "Missouri":                                         "MO",
                    "Montana":                                          "MT",
                    "Nebraska":                                         "NE",
                    "Nevada":                                           "NV",
                    "New Hampshire":                                    "NH",
                    "New Jersey":                                       "NJ",
                    "New Mexico":                                       "NM",
                    "New York":                                         "NY",
                    "North Carolina":                                   "NC",
                    "North Dakota":                                     "ND",
                    "Ohio":                                             "OH",
                    "Oklahoma":                                         "OK",
                    "Oregon":                                           "OR",
                    "Pennsylvania":                                     "PA",
                    "Rhode Island":                                     "RI",
                    "South Carolina":                                   "SC",
                    "South Dakota":                                     "SD",
                    "Tennessee":                                        "TN",
                    "Texas":                                            "TX",
                    "Utah":                                             "UT",
                    "Vermont":                                          "VT",
                    "Virginia":                                         "VA",
                    "Washington":                                       "WA",
                    "West Virginia":                                    "WV",
                    "Wisconsin":                                        "WI",
                    "Wyoming":                                           "WY"
                };

                queue()
                    .defer(d3.json, "app/static/us_states.json")
                    .defer(d3.json, "app/static/cms_data.json")
                    .awaitAll(ready);

                function ready(error, data) {
                    if (scope.$parent.loaded) {
                        return;
                    }
                    if (error) {
                        console.error(error);
                    }
                    us_states = data[0];
                    cms_data = data[1];
                    scope.$parent.column_names = cms_data.column_names.sort();
                    scope.$parent.loaded = true;
                    scope.$parent.$digest();
                    console.log("Loaded GEO and CMS data from JSON..");
                    render(scope.$parent.year, scope.$parent.variable,
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types), scope.$parent.proportion);
                }

                var width = 960,
                    height = 740;


                var projection = d3.geo.albersUsa()
                    .scale(1280)
                    .translate([width / 2, height / 2]);

                var path = d3.geo.path()
                    .projection(projection);

                function initalizeSvg() {
                    d3.select("svg").remove();
                    return d3.select("d3_map").append("svg")
                        .attr("width", width)
                        .attr("height", height);
                }

                function getDatum(year, enrollment_types, state_full, variable, proportion) {
                    if (!(state_full in state_name_map)) {
                        console.error(state_full + " not found in state map");
                    }
                    var state = state_name_map[state_full];

                    if (!(year in cms_data)) {
                        return 0.0;
                    }

                    var output = 0.0;
                    var total_enrolled = 0;
                    for (var i = 0; i < enrollment_types.length; i++) {
                        if (!(year in cms_data)) {
                            console.error(year + " not found in data");
                        }

                        if (!(enrollment_types[i] in cms_data[year])) {
                            console.error(enrollment_types[i] + " not found in year " + year);
                        }

                        if (!(state in cms_data[year][enrollment_types[i]])) {
                            console.error(state  + "(" + state_full + ") not found in year " + year + " type " + enrollment_types[i]);
                        }

                        if (!(variable in cms_data[year][enrollment_types[i]][state])) {
                            console.error(state + " not found in year " + year + " type " + enrollment_types[i] + " variable " + variable);
                        }

                        output += cms_data[year][enrollment_types[i]][state][variable];
                        if (!(numerator in cms_data[year][enrollment_types[i]][state])) {
                            console.error(state + " not found in year " + year + " type " + enrollment_types[i] + " variable " + numerator);
                        }
                        total_enrolled += cms_data[year][enrollment_types[i]][state][numerator];
                    }

                    if (proportion) {
                        output /= total_enrolled;
                    }

                    return Math.round(output);
                }

                function getAllForVariable(year, enrollment_types, variable, proportion) {
                    var states = d3.keys(state_name_map);
                    var output = [];
                    var datum;
                    for (var i = 0; i < states.length; i++) {
                        output.push(getDatum(year, enrollment_types, states[i], variable, proportion));
                    }
                    return output;
                }

                function render(year, variable, selected_enrollment_types, proportion) {
                    if (!scope.$parent.loaded) {
                        return;
                    }
                    console.log("Rendering " + variable + " for year " + year);
                    console.log(selected_enrollment_types);
                    console.log(proportion);

                    var all_values = getAllForVariable(year, selected_enrollment_types, variable, proportion);

                    console.log("Range is " + d3.extent(all_values));

                    var color = d3.scale.linear()
                        .domain(d3.extent(all_values))
                        .range(["#F7FBFF", "#08306B"]);

                    var scale = d3.scale.linear()
                        .domain(d3.extent(all_values))
                        .range([100, 800]);

                    var svg = initalizeSvg();

                    var format;

                    if (proportion) {
                        if (/dollar/i.test(variable) || /payment/i.test(variable)) {
                            format = d3.format("$.3s");
                        } else {
                            format = d3.format(".2%")
                        }
                    } else if (/number/i.test(variable) || /count/i.test(variable)) {
                        format = d3.format("4s");
                    } else if (/dollar/i.test(variable) || /payment/i.test(variable)) {
                        format = d3.format("$.3s");
                    } else {
                        format = d3.format("")
                    }

                    var xAxis = d3.svg.axis()
                        .scale(scale)
                        .orient("bottom")
                        .tickSize(13)
                        .tickFormat(format)
                        ;

                    function pair(array) {
                        return array.slice(1).map(function(b, i) {
                            return [array[i], b];
                        });
                    }

                    var legend = svg.append("g")
                        .attr("class", "legend")
                        .attr("transform", "translate(0," + (height - 60) + ")");

                    // legend
                    legend.selectAll("rect")
                        .append("g")
                        .data(pair([d3.min(all_values)].concat(scale.ticks(10)).concat([d3.max(all_values)])))
                        .enter().append("rect")
                        .attr("height", 8)
                        .attr("x", function(d) {
                            return scale(d[0]);
                        })
                        .attr("width", function(d) {
                            return scale(d[1]) - scale(d[0]);
                        })
                        .style("fill", function(d) { return color(d[0]); });

                    // legend
                    legend.call(xAxis)
                        .append("text")
                        .attr("class", "caption")
                        .attr("y", -12)
                        .attr("x", 90)
                        .text(variable);

                    // map
                    svg.append("g")
                        .attr("transform", "translate(0,-80)")
                        .attr("class", "states")
                        .selectAll("path")
                        .data(topojson.feature(us_states, us_states.objects.states).features)
                        .enter()
                        .append("path")
                        .attr("tooltip", function(d) {
                            return d.properties.name + ": " +
                                getDatum(year, selected_enrollment_types, d.properties.name, variable, proportion);
                        })
                        .attr("tooltip-append-to-body", true)
                        .attr("fill", function(d) {
                            return color(getDatum(year, selected_enrollment_types, d.properties.name, variable, proportion));
                        })
                        .attr("d", path);

                    $compile(element)(scope);
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

                function getTrueKey(obj) {
                    var arr = d3.entries(obj);
                    for (var i = 0; i<arr.length; i++) {
                        if(arr[i].value) {
                            return arr[i].key;
                        }
                    }
                }

                scope.$watch('variable', function (newVals, oldVals) {
                    render(scope.$parent.year,
                        scope.$parent.variable,
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types),
                        scope.$parent.proportion);
                }, true);

                scope.$watch('year', function (newVals, oldVals) {
                    render(scope.$parent.year,
                        scope.$parent.variable,
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types),
                        scope.$parent.proportion);
                }, true);

                scope.$watch('enrollment_types', function (newVals, oldVals) {
                    render(scope.$parent.year,
                        scope.$parent.variable,
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types),
                        scope.$parent.proportion);
                }, true);

                scope.$watch('proportion', function (newVals, oldVals) {
                    render(scope.$parent.year,
                        scope.$parent.variable,
                        getEnrollmentTypesAsArray(scope.$parent.enrollment_types),
                        scope.$parent.proportion);
                }, true);
            }
        };
    }]
);

