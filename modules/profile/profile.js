angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService,
                                                          actionService, $rootScope) {
    // Variables
    var ctrl = this;
    $scope.user = {name: "", userId: actionService.getCurrentId(store.get('token'))};
    $scope.actualTab = 'address';
    $scope.avatarDefault = 'assets/defaultUser.jpg';
    $scope.avatar64 = {base64: ''};
    $scope.selectedCategory = 1;
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
        apiService.getUser($scope.user.userId,
            function (success) {
                $scope.user = angular.fromJson(success);
            },
            function (error) {
                console.log(error);
            });
    };

    $scope.changeTab = function (tab) {
        $scope.actualTab = tab;
    };

    $scope.changeProfilePicture = function () {
        // Todo: send to server
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
            function(success, status){
                var data = angular.fromJson(success);
                $rootScope.$broadcast('addAlert', {type: 'success', msg: 'Daten wurden erfolgreich gespeichert'});
                console.log('success!');
                console.log(success);
            },
                function(error, status) {
                    var data = angular.fromJson(error);
                    $rootScope.$broadcast('addAlert', {type: 'danger', msg: 'Daten konnten nicht gespeichert werden'});
                    console.log('error!');
                    console.log(error);
                });

        for (var i = 0; i < $scope.newLessons.length; i++){
            for (var j = 0; j < $scope.categories.length; j++){
                if ($scope.categories[j].categoryId === $scope.newLessons[i].categoryId){
                    $scope.newLessons[i].categoryName = $scope.categories[j].categoryName;
                }
            }
        }
        $scope.user.lessons = $scope.user.lessons.concat($scope.newLessons);
        $scope.newLessons = [];
    };

// Function Calls
    $scope.getMyData();
    $scope.getCategoryList();
});
