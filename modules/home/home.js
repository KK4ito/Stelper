angular.module('app').controller('HomeCtrl',function($scope, $state, actionService, apiService, $timeout, uiGmapGoogleMapApi){

    // Settings, Checks

    // Variables
    var ctrl = this;
    $scope.cat = {};
    $scope.cat.selected = undefined;
    ctrl.filterSelected = '';
    $scope.map = {};
    $scope.markers = [];
    ctrl.currentUser = {};
    $scope.categories = [];
    $scope.mapRefresh = false;
    ctrl.defaultRadius = 0.3;


    // Function Definitions
    ctrl.createMarkers = function (center) {
        apiService.getMarkers({
            southwest: {
                latitude: center.latitude - ctrl.defaultRadius,
                longitude: center.longitude - ctrl.defaultRadius
            },
            northeast: {
                latitude: center.latitude + ctrl.defaultRadius,
                longitude: center.longitude + ctrl.defaultRadius
            }
        },
        function (success) {
            if (ctrl.filterSelected !== '') {
                var data = angular.fromJson(success);
                var filtered = data.filter(function (element) {
                    if (element) {}
                });
                $scope.markers = angular.fromJson(success);
            }
            $scope.markers = angular.fromJson(success);

        },
        function (error) {
            console.error('Keine Markers gefunden');
        });
    };

    ctrl.createMap = function (center, markers) {
        $scope.map = {
            center: {
                latitude: center.latitude,
                longitude: center.longitude
            },
            zoom: 15,
            markers: $scope.markers,
            options: {
                scrollwheel: false
            },
            controls: {

            },
            events: {
                dragend: function (mapModel, eventName, originalEventArgs) {
                    ctrl.mapDragend(mapModel, eventName, originalEventArgs);
                }
            }
        };
    };

    ctrl.mapDragend = function (mapModel, eventName, originalEventArgs) {
        var lat = mapModel.center.lat(), lng = mapModel.center.lng();

        ctrl.createMarkers({
            latitude: lat,
            longitude: lng
        });
    };

    ctrl.getCategoryList = function () {
        apiService.getCategories(
            function (success) {
                $scope.categories = angular.fromJson(success);
            },
            function (error) {

            }
        );
    };

    // Function Calls
    ctrl.getCategoryList();

    actionService.getCurrentPosition().then(
        function (data) {
            // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
            ctrl.currentUser.latitude = data.coords.latitude;
            ctrl.currentUser.longitude = data.coords.longitude;
            var center = {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude
            };
            ctrl.createMap(center, ctrl.createMarkers(center));
        },
        function (data) {
            // data looks like this -> PositionError {code: 1, message: "User denied Geolocation"}
            // Default Center and TODO: Show Error Message
            var center = {
                latitude: 47,
                longitude: 8
            };
            ctrl.createMap(center, ctrl.createMarkers(center));
        }
    );

});
