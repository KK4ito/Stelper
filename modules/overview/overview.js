angular.module('app').controller('OverviewCtrl',function($scope, apiService, actionService, $stateParams, $rootScope){

    // Variables
    var ctrl = this;
    $scope.user = {};

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
    };

    // Functions run
    ctrl.getUser();

});
