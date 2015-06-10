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


App.controller('MapController', ['$scope', '$timeout', 'queue', 'd3', '$routeParams', '$location',
    function ($scope, $timeout, queue, d3, $routeParams, $location) {
        var route_vars = ['variable', 'year', 'comparison_year', 'denominator'];
        var defaults = ["Total Medicare IP Hospital FFS payments", "2006", false, false];

        $scope.variable_categories = {};
        $scope.categories_show = {};
        $scope.column_names = [];
        $scope.loaded = false;

        d3.json("app/static/variable_categories.json", function (data) {
            $scope.variable_categories = data;
            var arr = d3.keys(data);
            for (var i = 0; i < arr.length; i++) {
                $scope.categories_show[arr[i]] = false;
            }
            $scope.loaded = true;
            $scope.$digest();

        });

        function initializeFromRoute() {
            for (var i = 0; i < route_vars.length; i++) {
                if (typeof $routeParams[route_vars[i]] !== 'undefined') {
                    $scope[route_vars[i]] = $routeParams[route_vars[i]];
                } else {
                    $scope[route_vars[i]] = defaults[i];
                }
            }

            $scope.enrollment_types = {
                'Full Benefit': $routeParams.full_benefit ? true : true,
                'Partial Benefit': $routeParams.partial_benefit ? true : false,
                'Medicare Only': $routeParams.medicare_only ? true : false,
                'Medicaid Only (Disability)': $routeParams.medicaid_only ? true : false
            };
        }

        $scope.setvar = function (v) {
            $scope.variable = v;
            updateUrl();
        };

        $scope.toggle_category = function (category) {
            $scope.categories_show[category] = !$scope.categories_show[category];
        };

        function updateUrl() {
            for (var i = 0; i < route_vars.length; i++) {
                $location.search(route_vars[i], $scope[route_vars[i]]);
            }
            $location.search('full_benefit', $scope.enrollment_types['Full Benefit']);
            $location.search('partial_benefit', $scope.enrollment_types['Partial Benefit']);
            $location.search('medicare_only', $scope.enrollment_types['Medicare Only']);
            $location.search('medicaid_only', $scope.enrollment_types['Medicaid Only (Disability)']);
        }

        initializeFromRoute();
    }
]);

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/views/map.html',
            controller: 'MapController',
            reloadOnSearch: false
        });
}]);

