angular.module('app').controller('LoginCtrl', function($rootScope, $scope, $http, store, $state, apiService){

    $scope.loginUser = {};
    $scope.registerUser = {};
    $scope.isLogin = ($state.current.name === 'login');

    $scope.login = function() {
        if(Object.keys($scope.registerUser).length === 2) {
            apiService.login(
                $scope.loginUser,
                function(data, status) {
                    store.set('token', data.token);
                    //store.set('userId', data.userId); TODO: not implemented yet on server side
                    $state.go('home');
                },
                function(data, status) {
                    $rootScope.addAlert('danger', 'Error: '+status+' :: '+data);
                });
        }
    };

    $scope.register = function() {
        if(Object.keys($scope.registerUser).length === 4) {
            apiService.register(
                $scope.registerUser,
                function(data, status) {
                    store.set('token', data.token);
                    //store.set('userId', data.userId); TODO: not implemented yet on server side
                    $state.go('profile');
                },
                function(data, status) {
                    $rootScope.addAlert('danger', 'Error: '+status+' :: '+data);
                }
            );
        }
    };

});
