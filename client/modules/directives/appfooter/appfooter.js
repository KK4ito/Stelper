angular.module('app').directive('appfooter', function() {
    return {
        // only match Attribute name
        restrict: 'A',
        // replaces the element instead of only inserting
        replace: true,
        scope: {

        },
        templateUrl: 'modules/directives/appfooter/appfooter.html'
    };
});
