angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService,
                                                          actionService, $rootScope, uiGmapGoogleMapApi, uiGmapIsReady,
                                                          $timeout) {
    // VARIABLES
    var ctrl = this;
    $scope.map = {};
    $scope.marker = [];
    $scope.mapLoaded = false;
    $scope.newLessons = [];
    $scope.categories = [];
    $scope.actualTab = 'address';
    $scope.user = {name: '', userId: actionService.getCurrentId(store.get('token')), avatar: 'none'};

    // SETTINGS, CHECKS
    if (store.get('token') === null) {
        $state.go('login');
    }
    if (!actionService.checkLoginState(store.get('token'))) {
        $state.go('login');
    }

    $rootScope.$broadcast('updateNav', {});

    // FUNCTION DEFINITIONS

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
     * Gets the current logged in users data
     */
    $scope.getMyData = function () {
        var center;
        apiService.getUser($scope.user.userId,
            function (success) {
                $scope.user = angular.fromJson(success);
                if ($scope.user.latitude === 0 && $scope.user.longitude === 0) {
                    center = {
                        latitude: 47,
                        longitude: 8
                    };
                    $scope.createMap(center, $scope.createMarker(center, false));
                } else {
                    center = {
                        latitude: $scope.user.latitude,
                        longitude: $scope.user.longitude
                    };
                    $scope.createMap(center, $scope.createMarker(center, false));
                }
            },
            function (error) {
            });
        apiService.getAvatar($scope.user.userId,
            function (success) {
                $scope.user.avatar = angular.fromJson(success);
            },
            function (error) {
                $scope.user.avatar = 'none';
            });
    };

    /**
     * Changes tabs from profile
     * @param tab String name of the tab
     */
    $scope.changeTab = function (tab) {
        $scope.actualTab = tab;
    };

    /**
     * Directly saves profile picture in database
     */
    $scope.saveProfilePicture = function () {
        apiService.uploadAvatar($scope.user.userId, $scope.user.avatar,
            function (success) {
            },
            function (error) {
            });
    };

    /**
     * Adds a new element in array of newLessons
     */
    $scope.addLesson = function () {
        var newItem = {categoryName: '', categoryId: '1', visible: '1'};
        $scope.newLessons.push(newItem);
    };

    /**
     * Removes a new element in array of newLessons
     *
     * @param index int index of the array element
     */
    $scope.deleteNewLesson = function (index) {
        $scope.newLessons.splice(index, 1);
    };

    /**
     * Removes an already existent lesson in the database from the current user
     *
     * @param index int index of the array element
     */
    $scope.deleteOldLesson = function (index) {
        $scope.user.lessons.splice(index, 1);
    };

    /**
     * Saves the whole user object
     */
    $scope.save = function () {
        apiService.updateUser($scope.user.userId, $scope.user,
            function (success, status) {
                var data = angular.fromJson(success);
                $rootScope.$broadcast('addAlert', {type: 'success', msg: 'Daten wurden erfolgreich gespeichert'});
            },
            function (error, status) {
                var data = angular.fromJson(error);
                $rootScope.$broadcast('addAlert', {type: 'danger', msg: 'Daten konnten nicht gespeichert werden'});
            });

        for (var i = 0; i < $scope.newLessons.length; i++) {
            for (var j = 0; j < $scope.categories.length; j++) {
                if ($scope.categories[j].categoryId === $scope.newLessons[i].categoryId) {
                    $scope.newLessons[i].categoryName = $scope.categories[j].categoryName;
                }
            }
        }
        $scope.user.lessons = $scope.user.lessons.concat($scope.newLessons);
        $scope.newLessons = [];
    };

    /**
     * Creates a marker on a given position
     *
     * @param position Json Object containing latitude and longitude
     * @param fromEvent Boolean if coming from an event
     */
    $scope.createMarker = function (position, fromEvent) {
        uiGmapIsReady.promise().then(function () {
            $scope.marker[0] = {};
            if (fromEvent || $scope.user.latitude === 0 && $scope.user.longitude === 0) {
                $scope.marker[0].coords = position;
                $scope.marker[0].id = 0;
            } else {
                $scope.marker[0].coords = {longitude: $scope.user.longitude, latitude: $scope.user.latitude};
                $scope.marker[0].id = 0;
            }
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
            markers: $scope.marker,
            options: {
                scrollwheel: false
            },
            controls: {},
            events: {
                click: function (mapModel, eventName, originalEventArgs) {
                    $scope.mapClick(mapModel, eventName, originalEventArgs);

                }
            }
        };
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.mapLoaded = true;
        });
    };

    /**
     * Map Click event. Calling createMarker function to set a marker on the clicked position.
     *
     * @param mapModel Google Maps Object
     * @param eventName
     * @param originalEventArgs
     */
    $scope.mapClick = function (mapModel, eventName, originalEventArgs) {
        var lat = originalEventArgs[0].latLng.lat(), lng = originalEventArgs[0].latLng.lng();

        $scope.user.latitude = lat;
        $scope.user.longitude = lng;

        $scope.createMarker({
            latitude: lat,
            longitude: lng
        }, true);
    };

    /**
     * listener function called on change from the 4 address fields and adjusting the user object
     */
    $scope.onChangeAddress = function () {
        $timeout(function () {
            actionService.getPositionByAddress(
                'Switzerland,' +
                $scope.user.postalCode + ' ' +
                $scope.user.place + ', ' +
                $scope.user.streetName + ' ' +
                $scope.user.streetNr,
                function (success){
                    var position = {
                        latitude: success.results[0].geometry.location.lat,
                        longitude: success.results[0].geometry.location.lng
                    };

                    $scope.user.latitude = position.latitude;
                    $scope.user.longitude = position.longitude;

                    $scope.createMap(position);
                    $scope.createMarker(position, true);
                });
        }, 3000);
    };

    // FUNCTION CALLS
    $scope.getMyData();
    $scope.getCategoryList();


});
