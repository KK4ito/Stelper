angular.module('app').controller('HeaderCtrl',function($rootScope, $state, $scope, actionService, store){

    // Settings

    // Variables
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));

    // Function Definitions
    $rootScope.$on('updateNav', function (event, args) {
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    });

    $scope.logout = function () {
        store.remove('token');
        store.remove('userId');
        $state.go('home', {reload: true});
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    };

    // Function Calls
});
