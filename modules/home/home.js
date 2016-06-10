angular.module('app').controller('HomeCtrl',function($scope, $state, actionService, apiService,
                                                     uiGmapGoogleMapApi, uiGmapIsReady, $rootScope){
    // VARIABLES
    var ctrl = this;
    $scope.map = {};
    $scope.markers = [];
    $scope.categories = [];
    $scope.maploaded = false;
    $scope.currentUser = {};
    $scope.defaultRadius = 0.3;
    $scope.cat = {selected: undefined, categoryName: ''};
    $scope.movedMapCenter = {moved: false, latitude: 0, longitude: 0};

    // SETTINGS, CHECKS
    $rootScope.$broadcast('updateNav', {});

    // FUNCTION DEFINITIONS

    /**
     * Gets all markers in a given radius
     * 
     * @param center Json Object position of the center of the map containing latitude and longitude
     */
    $scope.createMarkers = function (center) {
        apiService.getMarkers({
                southwest: {
                    latitude: center.latitude - $scope.defaultRadius,
                    longitude: center.longitude - $scope.defaultRadius
                },
                northeast: {
                    latitude: center.latitude + $scope.defaultRadius,
                    longitude: center.longitude + $scope.defaultRadius
                }
            },
            function (success) {
                    uiGmapIsReady.promise().then(function () {
                        var temp = angular.fromJson(success);
                        console.log(temp);
                        if($scope.cat.selected !== undefined) {
                            // Filtering
                            $scope.markers = temp.filter(function (e) {
                                e.id = e.userId;
                                e.coords = {latitude: e.latitude, longitude: e.longitude};
                                e.show = false;
                                return e.lessons.some(function (e2) {
                                    return ($scope.cat.selected.categoryName === e2.categoryName);
                                });
                            });
                        } else {
                            // Not filtering
                            $scope.markers = temp.map(function (e) {
                                e.id = e.userId;
                                e.coords = {latitude: e.latitude, longitude: e.longitude};
                                e.show = false;
                                return e;
                            });
                        }
                    });
            },
            function (error) {
                console.error('Keine Markers gefunden');
            });
    };

    /**
     * Creates a map object with a center
     * @param center Json Object containing latitude and longitude
     */
    $scope.createMap = function (center) {
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
            markerEvents: {
                goTo: function (id) {
                    $scope.goTo(id);
                }
            },
            events: {
                dragend: function (mapModel, eventName, originalEventArgs) {
                    $scope.mapDragend(mapModel, eventName, originalEventArgs);
                }
            }
        };
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.maploaded = true;
        });
    };

    /**
     * Maps dragend event. Calls createMarkers on a dragend event to get the markers on the new position/center
     * 
     * @param mapModel Google Maps Object
     * @param eventName
     * @param originalEventArgs
     */
    $scope.mapDragend = function (mapModel, eventName, originalEventArgs) {
        var lat = mapModel.center.lat(), lng = mapModel.center.lng();
        $scope.movedMapCenter = {moved: true, latitude: lat, longitude: lng};

        $scope.createMarkers({
            latitude: lat,
            longitude: lng
        });
    };

    /**
     * Gets all categories
     */
    $scope.getCategoryList = function () {
        apiService.getCategories(
            function (success) {
                $scope.categories = angular.fromJson(success);
            },
            function (error) {

            }
        );
    };

    /**
     * Markers click event. Opens the window of the marker.
     * @param marker Google Maps Marker Object
     */
    $scope.markerClick = function (marker) {
        if(marker.show) {
            marker.show = false;
        } else {
            _.forEach($scope.markers, function(curMarker) {
                curMarker.show = false;
            });
            marker.show = true;
        }
    };

    /**
     * Marker close event. Closes the window of the marker.
     * @param marker Google Maps Marker Object
     */
    $scope.markerClose = function (marker) {
        marker.show = false;
    };

    // FUNCTION CALLS
    $scope.getCategoryList();
    $scope.$watch('cat.selected', function () {
        // Listener for markers filter
        if ($scope.movedMapCenter.moved) {
            var center = {
                latitude: $scope.movedMapCenter.latitude,
                longitude: $scope.movedMapCenter.longitude
            };
            $scope.createMarkers(center);
        } else {
            actionService.getCurrentPosition().then(
                function (data) {
                    // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
                    $scope.currentUser.latitude = data.coords.latitude;
                    $scope.currentUser.longitude = data.coords.longitude;
                    var center = {
                        latitude: data.coords.latitude,
                        longitude: data.coords.longitude
                    };
                    $scope.createMarkers(center);
                },
                function (data) {
                }
            );
        }
    });
    angular.element(document).ready(function () {
        actionService.getCurrentPosition().then(
            function (data) {
                // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
                $scope.currentUser.latitude = data.coords.latitude;
                $scope.currentUser.longitude = data.coords.longitude;
                var center = {
                    latitude: data.coords.latitude,
                    longitude: data.coords.longitude
                };
                $scope.createMarkers(center);
                $scope.createMap(center);
            },
            function (data) {
                    // data looks like this -> PositionError {code: 1, message: "User denied Geolocation"}
                    // Default Center and TODO: Show Error Message
                    var center = {
                        latitude: 47,
                        longitude: 8
                    };
                    $scope.createMarkers(center);
                    $scope.createMap(center);
            }
        );
    });

});
