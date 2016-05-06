angular.module('app').controller('HomeCtrl',function($scope, helperService){

    helperService.getCurrentPosition().then(
        function (data) {
            // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
            console.log(data.coords.latitude);
            $scope.setMap(data.coords.latitude, data.coords.longitude);
            console.log(data);
        },
        function (data) {
            // data looks like this -> PositionError {code: 1, message: "User denied Geolocation"}
            // Default Center and TODO: Show Error Message
            $scope.setMap(47, 8);
            console.log(data);
        }
    );

    $scope.setMap = function (lat, lon) {
        $scope.map = {center: {latitude: $scope.position.latitude, longitude: $scope.position.longitude }, zoom: 14 };
        $scope.options = {scrollwheel: false};
    };

});
