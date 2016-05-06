angular.module('app').controller('LoginCtrl', function($scope, $http, store, $state, apiService){

    $scope.user = {};

    $scope.login = function() {
        apiService.login(
            $scope.user,
            function(data, status) {
                store.set('token', data.token);
                //store.set('userId', data.userId); TODO: not implemented yet on server side
                $state.go('home');
            },
            function(data, status) {
                window.alert("Message: "+data+"/n Status: "+status);
            });
    };

});
