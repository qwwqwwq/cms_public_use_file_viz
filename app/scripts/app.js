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
        $scope.variable = "Number of People";
        $scope.column_names = [];
        $scope.year = "2006";
        $scope.years = ["2006", "2007", "2008", "2009", "2010"];
        $scope.selected_enrollment_types = ['Full Benefit'];
        $scope.enrollment_types = ['Full Benefit', 'Partial Benefit', 'Medicare Only', 'Medicaid Only (Disability)'];
    }
]);

App.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
                  templateUrl: 'app/views/map.html',
                  controller: 'MapController'
              });
}]);

