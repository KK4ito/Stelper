angular.module('app').directive('appheader', ['$rootScope', function($rootScope) {
    return {
        // only match Attribute name
        restrict: 'A',
        // inserts the content instead of directly replacing
        replace: false,
        // variables to be used in its scope
        scope: {

        },
        link:function (scope, iElement, iAttrs){
            scope.loggedIn = $rootScope.loggedIn;
        },
        templateUrl: 'modules/directives/appheader/appheader.html'
    };
}]);
