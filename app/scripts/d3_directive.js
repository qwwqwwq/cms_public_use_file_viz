'use strict';

angular.module('d3Directives').directive(
    'd3Map',
    ['d3', 'queue', 'topojson', function (d3, queue, topojson) {
        return {
            restrict: 'EA',
            scope: true,
            link: function (scope, element, attrs) {
                var us_states, cms_data, year, variable;


                var state_name_map =
                {
                    "Alabama":                               "AL",
                    "Alaska":                                "AK",
                    "American Samoa":                        "AS",
                    "Arizona":                               "AZ",
                    "Arkansas":                              "AR",
                    "California":                            "CA",
                    "Colorado":                              "CO",
                    "Connecticut":                           "CT",
                    "Delaware":                              "DE",
                    "District Of Columbia":                  "DC",
                    "Federated States Of Micronesia":                   "FM",
                    "Florida":                                          "FL",
                    "Georgia":                                          "GA",
                    "Guam":                                             "GU",
                    "Hawaii":                                           "HI",
                    "Idaho":                                            "ID",
                    "Illinois":                                         "IL",
                    "Indiana":                                          "IN",
                    "Iowa":                                             "IA",
                    "Kansas":                                           "KS",
                    "Kentucky":                                         "KY",
                    "Louisiana":                                        "LA",
                    "Maine":                                            "ME",
                    "Marshall Islands":                                 "MH",
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
                    "Northern Mariana Islands":                         "MP",
                    "Ohio":                                             "OH",
                    "Oklahoma":                                         "OK",
                    "Oregon":                                           "OR",
                    "Palau":                                            "PW",
                    "Pennsylvania":                                     "PA",
                    "Puerto Rico":                                      "PR",
                    "Rhode Island":                                     "RI",
                    "South Carolina":                                   "SC",
                    "South Dakota":                                     "SD",
                    "Tennessee":                                        "TN",
                    "Texas":                                            "TX",
                    "Utah":                                             "UT",
                    "Vermont":                                          "VT",
                    "Virgin Islands":                                   "VI",
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
                    scope.$parent.column_names = cms_data.column_names;
                    scope.$parent.loaded = true;
                    scope.$parent.$digest();
                    console.log("Loaded GEO and CMS data from JSON..");
                }

                var width = 960,
                    height = 600;


                var projection = d3.geo.albersUsa()
                    .scale(1280)
                    .translate([width / 2, height / 2]);

                var path = d3.geo.path()
                    .projection(projection);

                function initalizeSvg() {
                    d3.select("svg").remove();
                    return d3.select("d3_map").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g");
                }

                function render(year, variable) {
                    if (!scope.$parent.loaded) {
                        return;
                    }
                    console.log("Rendering " + variable);

                    var raw_values = d3.values(cms_data[year]);

                    var color = d3.scale.linear()
                        .domain(d3.extent(raw_values, function(x) {
                            return x[variable]
                        }))
                        .range(["#F7FBFF", "#08306B"]);

                    var scale = d3.scale.linear()
                        .domain(d3.extent(raw_values, function(x) {
                            return x[variable]
                        }))
                        .range(0, 240);

                    var svg = initalizeSvg();

                    var xAxis = d3.svg.axis()
                        .scale(scale)
                        .orient("bottom")
                        .tickSize(13)
                        .tickFormat(d3.format("+.0f"));

                    function pair(array) {
                        return array.slice(1).map(function(b, i) {
                            return [array[i], b];
                        });
                    }

                    console.log(pair(scale.ticks(10)));

                    // legend
                    svg.selectAll("rect")
                        .data(pair(scale.ticks(10)))
                        .enter().append("rect")
                        .attr("height", 8)
                        .attr("x", function(d) {
                            return scale(d[0]);
                        })
                        .attr("width", function(d) { return scale(d[1]) - scale(d[0]); })
                        .style("fill", function(d) { return color(d[0]); });

                    // legend
                    svg.call(xAxis).append("text")
                        .attr("class", "caption")
                        .attr("y", -6)
                        .text(variable);

                    // map
                    svg.attr("class", "states")
                        .selectAll("path")
                        .data(topojson.feature(us_states, us_states.objects.states).features)
                        .enter()
                        .append("path")
                        .attr("fill", function(d) {
                            var state = state_name_map[d.properties.name];
                            if (year in cms_data && state in cms_data[year] && variable in cms_data[year][state]) {
                                return color(cms_data[year][state][variable]);
                            } else {
                                return "#000000";
                            }
                        })
                        .attr("d", path);
                }

                scope.$watch(attrs.variable, function (newVals, oldVals) {
                    variable = newVals;
                    return render(year, variable);
                }, true);

                scope.$watch(attrs.year, function (newVals, oldVals) {
                    year = newVals;
                    return render(year, variable);
                }, true);
            }
        };
    }]
);

