angular.module('app').directive('appheader', function() {
    return {
        // only match Attribute name
        restrict: 'A',
        // inserts the content instead of directly replacing
        replace: false,
        // variables to be used in its scope
        scope: {

        },
        templateUrl: 'modules/directives/appheader/appheader.html'
    };
});
