(function () {
    'use strict';
    angular.module('data')
        .factory('data', ['d3', 'queue', function (d3, queue) {
            var output = {};

            queue()
                .defer(d3.json, "app/static/us_states.json")
                .defer(d3.json, "app/static/cms_data.json")
                .awaitAll(ready);

            function ready(error, data) {
                if (error) {
                    console.error(error);
                }
                output.us_states = data[0];
                output.cms_data = data[1];
            }

            output.state_name_map = {
                "Alabama": "AL",
                "Alaska": "AK",
                "Arizona": "AZ",
                "Arkansas": "AR",
                "California": "CA",
                "Colorado": "CO",
                "Connecticut": "CT",
                "Delaware": "DE",
                "District of Columbia": "DC",
                "Florida": "FL",
                "Georgia": "GA",
                "Hawaii": "HI",
                "Idaho": "ID",
                "Illinois": "IL",
                "Indiana": "IN",
                "Iowa": "IA",
                "Kansas": "KS",
                "Kentucky": "KY",
                "Louisiana": "LA",
                "Maine": "ME",
                "Maryland": "MD",
                "Massachusetts": "MA",
                "Michigan": "MI",
                "Minnesota": "MN",
                "Mississippi": "MS",
                "Missouri": "MO",
                "Montana": "MT",
                "Nebraska": "NE",
                "Nevada": "NV",
                "New Hampshire": "NH",
                "New Jersey": "NJ",
                "New Mexico": "NM",
                "New York": "NY",
                "North Carolina": "NC",
                "North Dakota": "ND",
                "Ohio": "OH",
                "Oklahoma": "OK",
                "Oregon": "OR",
                "Pennsylvania": "PA",
                "Rhode Island": "RI",
                "South Carolina": "SC",
                "South Dakota": "SD",
                "Tennessee": "TN",
                "Texas": "TX",
                "Utah": "UT",
                "Vermont": "VT",
                "Virginia": "VA",
                "Washington": "WA",
                "West Virginia": "WV",
                "Wisconsin": "WI",
                "Wyoming": "WY"
            };

            return output;
        }])
}());
