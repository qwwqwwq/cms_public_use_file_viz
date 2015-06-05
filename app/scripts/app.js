'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('data', ['d3', 'queue']);
angular.module('d3Directives', ['d3', 'queue', 'topojson', 'ui.bootstrap', 'data']);
angular.module('dropdownDirective', []);


var App = angular.module('App', ['d3Directives', 'ngRoute', 'ui.bootstrap', 'dropdownDirective'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);


App.controller('MapController', ['$scope', '$timeout', 'queue', 'd3',
    function ($scope, $timeout, queue, d3) {
        $scope.variable_categories = {};
        $scope.categories_show = {};
        $scope.loaded = false;
        d3.json("app/static/variable_categories.json", function(data) {
            $scope.variable_categories = data;
            var arr = d3.keys(data);
            for (var i = 0; i<arr.length; i++) {
                $scope.categories_show[arr[i]] = false;
            }
            $scope.loaded = true;
        });
        $scope.variable = "Total Medicare IP Hospital FFS payments";
        $scope.column_names = [];
        $scope.year = "2006";
        $scope.enrollment_types = {
            'Full Benefit': true,
            'Partial Benefit': false,
            'Medicare Only': false,
            'Medicaid Only (Disability)': false
        };
        $scope.denominator = false;

        $scope.setvar = function(v) {
            $scope.variable = v;
        };

        $scope.toggle_category = function(category) {
            $scope.categories_show[category] = !$scope.categories_show[category];
        };

    }
]);

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/map.html',
            controller: 'MapController'
        });
}]);

