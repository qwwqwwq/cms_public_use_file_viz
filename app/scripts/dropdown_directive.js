angular.module("dropdownDirective").directive('variable', [function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<li class="selection-item"><span>{{item}}</span></li>',
        link: function(scope, elm, attrs) {
            elm.on('mouseenter',function() {
                    elm.children().addClass('hovered-item');
                })
                .on('mouseleave',function() {
                    elm.children().removeClass('hovered-item');
                });
        }
    };
}]);