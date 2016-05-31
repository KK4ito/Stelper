angular.module('app').controller('ProfileCtrl',function(store, $state, $scope, apiService, actionService) {

    // Settings, Checks
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    if (!$scope.loggedIn) {
        $state.go('login');
    }

    // Variables
    var ctrl = this;
    $scope.user = {name: ""};
    $scope.actualTab = 'address';
    $scope.avatarDefault = 'assets/defaultUser.jpg';
    $scope.avatar64 = {base64: ''};
    $scope.selectedCategory = 1;
    $scope.loaded = false;

    // Function Definitions
    ctrl.getCategoryList = function () {
        apiService.getCategories(
            function (success) {
                $scope.categories = angular.fromJson(success);
                $scope.loaded = true;
            },
            function (error) {

            }
        );
    };

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
        // Todo: send to server
    };

    // Function Calls
    $scope.getMyData();
    ctrl.getCategoryList();
});
