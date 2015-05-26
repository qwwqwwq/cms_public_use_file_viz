'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('d3Directives', ['d3', 'queue', 'topojson']);

var App = angular.module('App', ['d3Directives', 'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);

App.controller('MapController', ['$scope', 'queue', 'd3',
    function($scope, queue, d3) {
        $scope.loaded = false;
        $scope.variable = undefined;
        $scope.column_names = ["none"];

        queue()
            .defer(d3.json, "app/static/us_states.json")
            .defer(d3.json, "app/static/cms_data.json")
            .awaitAll(ready);

        function ready(error, data) {
            if ($scope.loaded) {
                return;
            }
            if (error) {
                console.error(error);
            }
            console.log(data);
            $scope.us_states = data[0];
            $scope.cms_data = data[1];
            $scope.column_names = $scope.cms_data.column_names;
            $scope.loaded = true;
            console.log("Loaded GEO and CMS data from JSON..");
        }
    }
]);

App.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
                  templateUrl: 'app/views/map.html',
                  controller: 'MapController'
              });
}]);

