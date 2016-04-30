angular.module('app').directive('appfooter', function() {
    return {
        // only match Attribute name
        restrict: 'A',
        // inserts the content instead of directly replacing
        replace: false,
        // variables to be used in its scope
        scope: {

        },
        templateUrl: 'modules/directives/appfooter/appfooter.html'
    };
});
