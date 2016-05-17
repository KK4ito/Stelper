angular.module('app').controller('ProfileCtrl',function(store, $state, $scope, apiService, actionService){

    // Settings, Checks
    if (!$scope.loggedIn) { $state.go('login'); }

    // Variables
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    $scope.user = {name: ""};

    // Function Definitions
    $scope.getMyData = function () {
        apiService.getUser(1,
        function (success) {
            var data = angular.fromJson(success);
            console.log(data.name);
            $scope.user = data;
        },
        function (error) {
            console.log(error);
        });
    };

    // Function Calls
    $scope.getMyData();
});
