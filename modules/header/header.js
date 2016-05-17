angular.module('app').controller('HeaderCtrl',function($state, $scope, actionService, store){

    // Settings

    // Variables
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));

    // Function Definitions
    $scope.logout = function () {
        store.remove('token');
        store.remove('userId');
        $state.go('home', {reload: true});
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    };

    // Function Calls
});
