angular.module('app').controller('HomeCtrl',function($scope, $state, helperService, apiService){

    helperService.getCurrentPosition().then(
        function (data) {
            // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
            $scope.setMap(data.coords.latitude, data.coords.longitude);
        },
        function (data) {
            // data looks like this -> PositionError {code: 1, message: "User denied Geolocation"}
            // Default Center and TODO: Show Error Message
            $scope.setMap(47, 8);
        }
    );

    $scope.setMap = function (latitude, longitude) {
        $scope.map = {center: {latitude: latitude, longitude: longitude }, zoom: 14 };
        $scope.options = {scrollwheel: false};
    };

    $scope.test = function () {
        apiService.test(function(data, status) {
            window.alert("Success");
            console.log(data);
            console.log(status);
        }, function(data, status) {
            $state.go('login');
            console.log(data);
            console.log(status);
        });
    };

});
