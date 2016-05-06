angular.module('app').service('apiService',['$http', function($http) {

    // CONSTANTS
    var BASE = 'http://45.62.253.219/';
    var BASE_API = 'http://45.62.253.219/api';

    // EXTERNAL METHODS

    /**
     * Logs a user in.
     *
     * @param data      Json Object containining the credentials of the user
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.login = function (data, success, error) {
        $http.post(
            BASE_API + '/login',
            data
        ).success(success).error(error);
    };

    this.test = function (success, error) {
        $http.get(
            BASE_API + '/test'
        ).success(success).error(error);
    };

    /**
     * Lets the user logout.
     *
     * @param success   Pseudo callback function called when everything is done
     */
    this.logout = function (success) {
        $http.get(
            BASE_API + '/logout'
        );
    };

    /**
     * Registers a new user to the website.
     *
     * @param data      Json Object containining the registration information
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.register = function (data, success, error) {
        $http.post(
            BASE_API + '/users',
            data
        ).success(success).error(error);
    };

    /**
     * Updates a specific users password.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param data      Json Object containining the old and new password of the user
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.updatePassword = function (id, data, success, error) {
            $http.put(
                BASE_API + '/users/' + id + '/password',
                data
            ).success(success).error(error);
    };

    /**
     * Function for getting a list of users.
     *
     * @param filter    Takes a String like this: 'param1=value1&param2=value2'
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.getUsers = function (filter, success, error) {
        $http.get(
            BASE_API + '/users' + (typeof(filter) !== 'undefined' && filter != null)? '?' + filter : ''
        ).success(success).error(error);
    };

    /**
     * Asks for a specific users information.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.getUser = function (id, success, error) {
        $http.get(
            BASE_API + '/users/' + id
        ).success(success).error(error);
    };

    /**
     * Updates information about a specific user.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param data      Json Object containining the new information about a user
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.updateUser = function (id, data, success, error) {
        $http.put(
            BASE_API + '/users/' + id,
            data
        ).success(success).error(error);
    };

    /**
     * Deletes a user.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    this.deleteUser = function (id, success, error) {
        $http.delete(
            BASE_API + '/users/' + id
        ).success(success).error(error);
    };

}]);
