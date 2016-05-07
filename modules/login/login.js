angular.module('app').controller('LoginCtrl', function($scope, $http, store, $state, apiService){

    $scope.loginUser = {};
    $scope.registerUser = {};
    $scope.isLogin = ($state.current.name === 'login');
    console.log();

    $scope.login = function() {
        apiService.login(
            $scope.loginUser,
            function(data, status) {
                store.set('token', data.token);
                //store.set('userId', data.userId); TODO: not implemented yet on server side
                $state.go('home');
            },
            function(data, status) {
                window.alert("Message: "+data+"/n Status: "+status);
            });
    };

    $scope.register = function() {
        // TODO: check if form is filled out
        apiService.register(
            $scope.registerUser,
            function(data, status) {
                store.set('token', data.token);
                //store.set('userId', data.userId); TODO: not implemented yet on server side
                $state.go('profile');
            },
            function(data, status) {
                window.alert("Message: "+data+"/n Status: "+status);
            }
        )
    }

});
