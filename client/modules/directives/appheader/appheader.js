angular.module('app').directive('appheader', function() {
    return {
        // only match Attribute name
        restrict: 'A',
        // replaces the element instead of only inserting
        replace: true,
        scope: {

        },
        templateUrl: 'modules/directives/appheader/appheader.html'
    };
});
