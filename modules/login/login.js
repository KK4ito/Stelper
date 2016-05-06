angular.module('app').controller('LoginCtrl', function($scope, $http, store, $state, apiService){

    $scope.user = {};

    $scope.login = function() {
        apiService.login(
            $scope.user,
            function(success) {
                store.set('jwt', success.data.id_token);
                $state.go('home');
            },
            function(error) {
                window.alert(error.data);
            });
    };

});
