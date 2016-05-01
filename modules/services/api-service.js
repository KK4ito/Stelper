angular.module('app').factory('apiService',['$http', function($http, $localStorage, urls) {

    // Internal Methods

    // External Methods
    this.signup = function (data, success, error) {
        $http.post(
            urls.BASE_API + '/signup',
            data
        ).success(success).error(error);
    };

    this.signin = function (data, success, error) {
        $http.post(
            urls.BASE_API + '/signin',
            data
        ).success(success).error(error);
    };

    this.logout = function (data, success) {
        delete $localStorage.token;
        success();
    };

    this.getUsers = function (success, error) {
        return $http.get(
            urls.BASE_API + '/getUsers'
        ).success(success).error(error);
    };

    this.getUser = function (data, success, error) {
        return $http.get(
            urls.BASE_API + '/getUser',
            data
        ).success(success).error(error);
    };

}]);
