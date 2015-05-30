'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('d3Directives', ['d3', 'queue', 'topojson']);

var App = angular.module('App', ['d3Directives', 'ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);

App.controller('MapController', ['$scope', 'queue', 'd3',
    function($scope, queue, d3) {
        $scope.loaded = false;
        $scope.variable = "Number of People";
        $scope.column_names = [];
        $scope.year = "2006";
        $scope.years = ["2006", "2007", "2008", "2009", "2010"];
        $scope.enrollment_types = {'Full Benefit': true,
            'Partial Benefit': false,
            'Medicare Only': false,
            'Medicaid Only (Disability)': false};
        $scope.proportion = false;

        $scope.update = function() {
            console.log("update");
            $scope.$digest();
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

