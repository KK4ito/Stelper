angular.module('app').directive('appheader', function(store, actionService) {
    return {
        // only match Attribute name
        restrict: 'A',
        // inserts the content instead of directly replacing
        replace: false,
        // Template definition
        templateUrl: 'modules/header/header.html'
    };
});
