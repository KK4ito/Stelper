angular.module('app').service('apiService',['$http', function($http) {

    'use strict';

    // VARIABLES
    var BASE = 'http://45.62.253.219/';
    var BASE_API = 'http://45.62.253.219/api';
    var service = this;

    // EXTERNAL METHODS

    /**
     * Logs a user in.
     *
     * @param data      Json Object containining the credentials of the user
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.login = function (data, success, error) {
        $http.post(
            BASE_API + '/login',
            data
        ).success(success).error(error);
    };

    /**
     * Lets the user log out.
     *
     * @param success   Pseudo callback function called when everything is done
     */
    service.logout = function (success) {
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
    service.register = function (data, success, error) {
        $http.post(
            BASE_API + '/register',
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
    service.updatePassword = function (id, data, success, error) {
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
    service.getUsers = function (filter, success, error) {
        $http.get(
            BASE_API + '/users/markers',
            filter
        ).success(success).error(error);
    };

    /**
     * Asks for a specific users information.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.getUser = function (id, success, error) {
        $http.get(
            BASE_API + '/users/' + id
        ).success(success).error(error);
    };

    /**
     * Asks for a specific users information.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.getUserOverview = function (id, success, error) {
        $http.get(
            BASE_API + '/users/markers/' + id
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
    service.updateUser = function (id, data, success, error) {
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
    service.deleteUser = function (id, success, error) {
        $http.delete(
            BASE_API + '/users/' + id
        ).success(success).error(error);
    };

    /**
     * Uploads a profile picture to the server as Base64 String.
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param data      Contaings Base64 String of picture
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.uploadAvatar = function (id, data, success, error) {
        $http.put(
            BASE_API + '/users/' + id + '/picture',
            data
        ).success(success).error(error);
    };

    /**
     * Asks for the avatar of a specific user
     *
     * @param id        Takes an Integer value respresenting the users Identification Number
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.getAvatar = function (id, success, error) {
        $http.get(
            BASE_API + '/users/' + id + '/picture'
        ).success(success).error(error);
    };

    /**
     * Asks for markers in a certain radius
     *
     * @param data      Json object representing the bounds of the map (radius)
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.getMarkers = function (data, success, error) {
        $http.get(
            BASE_API + '/users/markers' +
            '?southwestlng=' + data.southwest.longitude +
            '&southwestlat=' + data.southwest.latitude +
            '&northeastlng=' + data.northeast.longitude +
            '&northeastlat=' + data.northeast.latitude
        ).success(success).error(error);
    };

    /**
     * Asks for all available categories
     *
     * @param success   Callback function called when request was successful
     * @param error     Callback function called when request was unsucessful
     */
    service.getCategories = function (success,error) {
        $http.get(
            BASE_API + '/categories'
        ).success(success).error(error);
    };

}]);
