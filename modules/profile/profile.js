angular.module('app').controller('ProfileCtrl', function (store, $state, $scope, apiService, actionService) {

    // Settings, Checks
    $scope.loggedIn = actionService.checkLoginState(store.get('token'));
    if (!$scope.loggedIn) {
        $state.go('login');
    }

    // Variables
    var ctrl = this;
    $scope.user = {name: ""};
    $scope.actualTab = 'address';
    $scope.avatarDefault = 'assets/defaultUser.jpg';
    $scope.avatar64 = {base64: ''};
    $scope.selectedCategory = 1;
    $scope.newLessons = [];
    $scope.categories = [];

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
    //TODO Gebe den newLessons Objekten den categoryName entsprechend einem Vergleich mit der categoryId in categories.
    // Das muss gemacht werden da wir von einem Select Element nur die value erhalten aber nicht den namen.

    // TODO pushe neue lessons in user.lessons array (z.B. mit forEach)

    // TODO Rufe Rest api auf um user objekt zu speichern in Datenbank
    // TODO Daten durch Klick auf Button speichern in DB
};

// Function Calls
$scope.getMyData();
$scope.getCategoryList();
})
;
