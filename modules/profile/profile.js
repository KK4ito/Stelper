angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService,
                                                          actionService, $rootScope, uiGmapGoogleMapApi, uiGmapIsReady) {
    // Variables
    var ctrl = this;
    $scope.user = {
        name: '',
        userId: actionService.getCurrentId(store.get('token')),
        avatar: 'none'
    };
    $scope.actualTab = 'address';
    $scope.selectedCategory = 1;
    $scope.map = {};
    $scope.marker = {};
    ctrl.movedMapCenter = {moved: false, latitude: 0, longitude: 0};
    $scope.newLessons = [];
    $scope.categories = [];

    // Settings, Checks
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    if (!$scope.loggedIn) {
        $state.go('login');
    }

    $rootScope.$broadcast('updateNav', {});

    // Function Definitions
    $scope.getCategoryList = function () {
        apiService.getCategories(
            function (success) {
                $scope.categories = angular.fromJson(success);
            },
            function (error) {

            }
        );
    };

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
                    ctrl.createMap(center, ctrl.createmarker(center));
                } else {
                    center = {
                        latitude: $scope.user.latitude,
                        longitude: $scope.user.longitude
                    };
                    console.log(center);
                    ctrl.createMap(center, ctrl.createmarker(center));
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

    $scope.changeTab = function (tab) {
        $scope.actualTab = tab;
    };

    $scope.changeProfilePicture = function () {
        apiService.uploadAvatar($scope.user.userId, $scope.user.avatar,
            function (success) {
                console.log("Success");
            },
            function (error) {
                console.log("Error");
            });
    };

    $scope.addLesson = function () {
        var newItem = {categoryName: '', categoryId: '1', visible: '1'};
        $scope.newLessons.push(newItem);
    };

    $scope.deleteNewLesson = function (index) {
        $scope.newLessons.splice(index, 1);
    };

    $scope.deleteOldLesson = function (index) {
        $scope.user.lessons.splice(index, 1);
    };

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

    ctrl.createmarker = function (center) {
        uiGmapIsReady.promise().then(function () {
            if ($scope.user.latitude === 0 && $scope.user.longitude === 0) {
                $scope.marker.coords = center;
                $scope.marker.id = 2;
            } else {
                $scope.marker.coords = {longitude: $scope.user.longitude, latitude: $scope.user.latitude};
                $scope.marker.id = 2;
            }
        });
    };

    ctrl.createMap = function (center) {
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
                    ctrl.mapClick(mapModel, eventName, originalEventArgs);

                }
            }
        };
    };

    ctrl.mapClick = function (mapModel, eventName, originalEventArgs) {
        var lat = mapModel.center.lat(), lng = mapModel.center.lng();

        ctrl.createmarker({
            latitude: lat,
            longitude: lng
        });
    };

// Function Calls
    $scope.getMyData();
    $scope.getCategoryList();

});
