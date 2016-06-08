angular.module('app').controller('OverviewCtrl',function($scope, apiService, actionService, $stateParams, $rootScope){

    // Variables
    var ctrl = this;
    $scope.user = {};
    $scope.user.avatar = 'none';

    // Settings, Checks
    $rootScope.$broadcast('updateNav', {});

    // Functions definitions
    ctrl.getUser = function () {
        apiService.getUser($stateParams.id,
        function (success) {
            $scope.user = angular.fromJson(success);
        },
        function (error) {

        });
        apiService.getAvatar($stateParams.id,
        function (success) {
            console.log(success);
            $scope.user.avatar = angular.fromJson(success);
        },
        function (error) {
            $scope.user.avatar = 'none';
        });
    };

    // Functions run
    ctrl.getUser();

});
