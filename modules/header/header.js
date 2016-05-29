angular.module('app').controller('HeaderCtrl',function($rootScope, $state, $scope, actionService,
                                                       store, $timeout){

    // Settings

    // Variables
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    $scope.alerts = [];

    // Function Definitions
    $rootScope.$on('updateNav', function (event, args) {
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    });

    $rootScope.$on('addAlert', function (event, args) {
        $scope.alerts.push({type: args.type, msg: args.msg});
        $timeout(function () {
            $scope.alerts.splice($rootScope.alerts.length-1, 1);
        }, 4000);
    });

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.logout = function () {
        store.remove('token');
        store.remove('userId');
        $state.go('home', {reload: true});
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    };

    // Function Calls
});
