angular.module('app').controller('LoginCtrl', function($rootScope, $scope, $http, store, $state, apiService, md5){

    // Settings, Checks

    // Variables
    $scope.loginUser = {};
    $scope.registerUser = {};
    $scope.isLogin = ($state.current.name === 'login');

    // Function Definitions
    $scope.login = function() {
        if(Object.keys($scope.loginUser).length === 2) {
            $scope.loginUser.password = md5.createHash($scope.loginUser.password);
            apiService.login(
                $scope.loginUser,
                function(success, status) {
                    var data = angular.fromJson(success);
                    store.set('token', data.token);
                    store.set('userId', data.id);
                    $rootScope.$broadcast('updateNav', {});
                    $state.go('home');
                },
                function(error, status) {
                    var data = angular.fromJson(error);
                    $rootScope.$broadcast('addAlert', {type: 'danger', msg: 'Falsche E-Mail oder Passwort'});
                });
        }
    };

    $scope.register = function() {
        if(Object.keys($scope.registerUser).length === 4) {
            $scope.registerUser.password = md5.createHash($scope.registerUser.password);
            apiService.register(
                $scope.registerUser,
                function(success, status) {
                    var data = angular.fromJson(success);
                    store.set('token', data.token);
                    store.set('userId', data.id);
                    $rootScope.$broadcast('updateNav', {});
                    $state.go('profile');
                },
                function(error, status) {
                    var data = angular.fromJson(error);
                    $rootScope.$broadcast('addAlert', {type: 'danger', msg: 'Error: '+status+' :: '+data.message});
                }
            );
        }
    };

    // Function Calls

});
