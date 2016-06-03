angular.module('app').controller('HomeCtrl',function($scope, $state, actionService, apiService, $timeout, uiGmapGoogleMapApi, uiGmapIsReady){
    
    // Variables
    var ctrl = this;
    $scope.cat = {};
    $scope.cat.selected = undefined;
    ctrl.filterSelected = '';
    $scope.map = {};
    $scope.markers = [];
    ctrl.currentUser = {};
    $scope.categories = [];
    ctrl.movedMapCenter = {moved: false, latitude: 0, longitude: 0};
    ctrl.defaultRadius = 0.3;
    
    // Settings, Checks
    $rootScope.$broadcast('updateNav', {});
    
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
                //if (ctrl.filterSelected !== '') {
                //    var data = angular.fromJson(success);
                //    var filtered = data.filter(function (element) {
                //        if (element) {}
                //    });
                //    $scope.markers = angular.fromJson(success);
                //}
                $scope.$watch($scope.active, function() {
                    $timeout(function () {
                        uiGmapIsReady.promise().then(function () {
                            var temp = angular.fromJson(success);
                            if($scope.cat.selected !== undefined) {
                                // Filtering
                                $scope.markers = temp.filter(function (e) {
                                    e.id = e.userId;
                                    e.coords = {latitude: e.latitude, longitude: e.longitude};
                                    return e.lessons.some(function (e2) {
                                        return ($scope.cat.selected.categoryName === e2.categoryName);
                                    });
                                });
                            } else {
                                // Not filtering
                                $scope.markers = temp.map(function (e) {
                                    e.id = e.userId;
                                    e.coords = {latitude: e.latitude, longitude: e.longitude};
                                    return e;
                                });
                            }
                        });
                    }, 0);
                });


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
            markersEvents: {
                click: function(marker, eventName, model) {
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            },
            window: {
                marker: {},
                show: false,
                closeClick: function() {
                    this.show = false;
                },
                options: {}
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
        ctrl.movedMapCenter = {moved: true, latitude: lat, longitude: lng};

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

    $scope.$watch('cat.selected', function () {
        // Listener for markers filter
        if (ctrl.movedMapCenter.moved) {
            var center = {
                latitude: ctrl.movedMapCenter.latitude,
                longitude: ctrl.movedMapCenter.longitude
            };
            ctrl.createMarkers(center);
        } else {
            actionService.getCurrentPosition().then(
                function (data) {
                    // data looks like this -> Geoposition {coords: Coordinates, timestamp: 1462572088941}
                    ctrl.currentUser.latitude = data.coords.latitude;
                    ctrl.currentUser.longitude = data.coords.longitude;
                    var center = {
                        latitude: data.coords.latitude,
                        longitude: data.coords.longitude
                    };
                    ctrl.createMarkers(center);
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
                console.log(data);
                var center = {
                    latitude: 47,
                    longitude: 8
                };
                ctrl.createMap(center, ctrl.createMarkers(center));
            }
        );
    });

});
