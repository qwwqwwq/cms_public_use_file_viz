'use strict';

angular.module('d3', []);
angular.module('topojson', []);
angular.module('queue', []);
angular.module('data', ['d3', 'queue']);
angular.module('d3Directives', ['d3', 'queue', 'topojson', 'ui.bootstrap', 'data']);
angular.module('dropdownDirective', []);


var App = angular.module('App', ['d3Directives', 'ngRoute', 'ui.bootstrap', 'dropdownDirective', 'angular-loading-bar'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });
    }]);


App.controller('MapController', ['$scope', '$timeout', 'queue', 'd3', '$routeParams', '$location', '$route',
    function ($scope, $timeout, queue, d3, $routeParams, $location, $route) {
        var route_vars = ['variable', 'year', 'comparison_year', 'denominator'];
        var defaults = ["Total Medicare IP Hospital FFS payments", "2006", false, false];

        $scope.variable_categories = {};
        $scope.categories_show = {};
        $scope.column_names = [];
        $scope.loaded = false;
        $scope.initialized = false;

        d3.json("app/static/variable_categories.json", function (data) {
            $scope.variable_categories = data;
            var arr = d3.keys(data);
            for (var i = 0; i < arr.length; i++) {
                $scope.categories_show[arr[i]] = false;
            }
            $scope.loaded = true;
            $scope.$digest();
        });

        $scope.$on('$routeChangeSuccess', function () {
            if (!$scope.initialized) {
                initializeFromRoute();
            }
        });

        $scope.$on('mapRender', updateUrl);

        function initializeFromRoute() {
            for (var i = 0; i < route_vars.length; i++) {
                if (typeof $routeParams[route_vars[i]] !== 'undefined') {
                    if ($routeParams[route_vars[i]] === 'false') {
                        $scope[route_vars[i]] = false;
                    } else {
                        $scope[route_vars[i]] = $routeParams[route_vars[i]];
                    }
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
            $scope.$digest();
        }

        $scope.setvar = function (v) {
            $scope.variable = v;
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


        var watches = ['variable', 'year', 'enrollment_types', 'denominator', 'loaded', 'comparison_year'];

        for (var i = 0; i < watches.length; i++) {
            $scope.$watch(watches[i],
                updateUrl,
                true);
        }

        $scope.presets = [
            {
                title: 'New Hampshire is an Outlier for Fee for Service Payments',
                variable: 'Total FFS dollars (Medicare and Medicaid) associated with IP hospital admissions',
                year: '2006', comparison_year: '2010',
                denominator: 'Number of People with FFS',
                enrollment_types: {
                    'Full Benefit': true,
                    'Partial Benefit': true,
                    'Medicare Only': true,
                    'Medicaid Only (Disability)': true
                }
            },
            {
                title: 'Home Health Care Payments Increasing in Middle America',
                variable: 'Total Medicare home health FFS payments',
                year: '2006', comparison_year: '2010',
                denominator: 'Number of People with FFS',
                enrollment_types: {
                    'Full Benefit': true,
                    'Partial Benefit': true,
                    'Medicare Only': true,
                    'Medicaid Only (Disability)': false
                }
            },
            {
                title: 'East Coast Has Higher Rates of Hypertension',
                variable: 'Number of FFS people with hypertension',
                year: '2010', comparison_year: false,
                denominator: 'Number of People with FFS',
                enrollment_types: {
                    'Full Benefit': true,
                    'Partial Benefit': true,
                    'Medicare Only': true,
                    'Medicaid Only (Disability)': true
                }
            },
            {
                title: 'Virginia is an Outlier for Readmission Rates',
                variable: 'Count of FFS Acute IP Hospital 30-day Readmissions - Medicare and Medicaid combined',
                year: '2010', comparison_year: false,
                denominator: 'Number of People with FFS',
                enrollment_types: {
                    'Full Benefit': true,
                    'Partial Benefit': true,
                    'Medicare Only': true,
                    'Medicaid Only (Disability)': true
                }
            }
        ];

        $scope.setFromPreset = function (settings) {
            for (var property in settings) {
                if (settings.hasOwnProperty(property) && property != 'title') {
                    $scope[property] = settings[property];
                }
            }
            $scope.$digest();
        };

        $scope.variableFFS = function () {
            return $scope.variable.toLowerCase().indexOf('ffs') > -1 &&
                $scope.variable.toLowerCase().indexOf('ffs males') == -1 &&
                $scope.variable.toLowerCase().indexOf('ffs females') == -1;

        };

        $scope.variableFFSFemales = function () {
            return $scope.variable.toLowerCase().indexOf('ffs females') > -1;
        };

        $scope.variableFFSMales = function () {
            return $scope.variable.toLowerCase().indexOf('ffs males') > -1;
        };

        $scope.variableNumberOfPeople = function () {
            return $scope.variable.toLowerCase().indexOf('ffs') == -1;
        };
    }
]);

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/map', {
            templateUrl: 'app/views/map.html',
            controller: 'MapController',
            reloadOnSearch: false
        })
        .otherwise({
            redirectTo: '/map'
        });
}]);

