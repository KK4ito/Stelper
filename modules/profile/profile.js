angular.module('app').controller('ProfileCtrl',function($scope, $rootScope, apiService){

    $scope.loggedIn = $rootScope.loggedIn;
    $scope.user = {};

    $scope.getMyData = function () {
        apiService.getUser(1,
        function (success) {
            window.console.log(success);
            //var data = angular.fromJson(); // wenn kein JSON Objekt dann auskommentieren
            $scope.user = data;
        },
        function (error) {
            window.console.log(error);

        });
    };

    $scope.getMyData();
});
