angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService, actionService) {

    // Variables
    var ctrl = this;
    $scope.user = {name: ""};
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
        apiService.getUser(1,
            function (success) {
                var data = angular.fromJson(success);
                console.log(data.name);
                $scope.user = data;
                console.log(data.lessons);
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
        apiService.updateUser(1, $scope.user,
            function(success){
                //TODO Meldungen auf Bildschirm
                console.log('success!');
            },
            function (error) {
                //TODO Meldungen auf Bildschirm
                console.log('error!');
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

        console.log($scope.user.lessons);
    };

// Function Calls
    $scope.getMyData();
    $scope.getCategoryList();
})
;
