angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService,
                                                          actionService, $rootScope, uiGmapGoogleMapApi, uiGmapIsReady) {
    // VARIABLES
    var ctrl = this;
    $scope.map = {};
    $scope.marker = {};
    $scope.newLessons = [];
    $scope.categories = [];
    $scope.actualTab = 'address';
    $scope.user = {name: '', userId: actionService.getCurrentId(store.get('token')), avatar: 'none'};

    // SETTINGS, CHECKS
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
                    $scope.createMap(center, $scope.createMarker(center));
                } else {
                    center = {
                        latitude: $scope.user.latitude,
                        longitude: $scope.user.longitude
                    };
                    console.log(center);
                    $scope.createMap(center, $scope.createMarker(center));
                }
            },
            function (error) {
                console.log(error);
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
                console.log("Success");
            },
            function (error) {
                console.log("Error");
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
                console.log('success!');
                console.log(success);
            },
            function (error, status) {
                var data = angular.fromJson(error);
                $rootScope.$broadcast('addAlert', {type: 'danger', msg: 'Daten konnten nicht gespeichert werden'});
                console.log('error!');
                console.log(error);
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
     */
    $scope.createMarker = function (position) {
        uiGmapIsReady.promise().then(function () {
            if ($scope.user.latitude === 0 && $scope.user.longitude === 0) {
                $scope.marker.coords = position;
                $scope.marker.id = 0;
            } else {
                $scope.marker.coords = {longitude: $scope.user.longitude, latitude: $scope.user.latitude};
                $scope.marker.id = 0;
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
            marker: $scope.marker,
            options: {
                scrollwheel: false
            },
            controls: {},
            events: {
                click: function (mapModel, eventName, originalEventArgs) {
                    console.log('tata');
                    $scope.mapClick(mapModel, eventName, originalEventArgs);

                }
            }
        };
    };

    /**
     * Map Click event. Calling createMarker function to set a marker on the clicked position.
     * 
     * @param mapModel Google Maps Object
     * @param eventName
     * @param originalEventArgs
     */
    $scope.mapClick = function (mapModel, eventName, originalEventArgs) {
        var lat = mapModel.center.lat(), lng = mapModel.center.lng();

        $scope.createMarker({
            latitude: lat,
            longitude: lng
        });
    };

    // FUNCTION CALLS
    $scope.getMyData();
    $scope.getCategoryList();

});
