angular.module('app').controller('HeaderCtrl',function($rootScope, $state, $scope, actionService,
                                                       store, $timeout){
    // VARIABLES
    $scope.alerts = [];
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));

    // SETTINGS, CHECKS

    // FUNCTION DEFINITIONS

    /**
     * Close alert on the specified index when clicking close icon
     *
     * @param index
     */
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    /**
     * Logging the user out when clicking logout icon
     */
    $scope.logout = function () {
        store.remove('token');
        store.remove('userId');
        $state.go('home', {reload: true});
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    };

    // FUNCTION CALLS
    $rootScope.$on('updateNav', function (event, args) {
        $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    });
    $rootScope.$on('addAlert', function (event, args) {
        $scope.alerts.push({type: args.type, msg: args.msg});
        $timeout(function () {
            $scope.alerts.splice($scope.alerts.length-1, 1);
        }, 4000);
    });
});
