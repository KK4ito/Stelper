angular.module('app').controller('OverviewCtrl',function($scope, apiService, $stateParams, $rootScope){

    // VARIABLES
    var ctrl = this;
    $scope.user = {};
    $scope.user.avatar = 'none';

    // SETTINGS, CHECKS
    $rootScope.$broadcast('updateNav', {});

    // FUNCTION DEFINITIONS

    /**
     * Get the requested users data
     */
    $scope.getUserOverview = function () {
        apiService.getUserOverview($stateParams.id,
        function (success) {
            $scope.user = angular.fromJson(success);
        },
        function (error) {

        });
        apiService.getAvatar($stateParams.id,
        function (success) {
            $scope.user.avatar = angular.fromJson(success);
        },
        function (error) {
            $scope.user.avatar = 'none';
        });
    };

    // FUNCTION CALLS
    $scope.getUserOverview();

});
