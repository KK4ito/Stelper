angular.module('app').controller('ProfileCtrl',function(store, $state, $scope, apiService, actionService){

    // Settings, Checks
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    if (!$scope.loggedIn) { $state.go('login'); }

    // Variables
    $scope.user = {name: ""};
    $scope.actualTab = 'address';

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

    $scope.changeTab = function (tab) {
        $scope.actualTab = tab;
    };

    $scope.changeProfilePicture = function () {

    };

    // Function Calls
    $scope.getMyData();
});
