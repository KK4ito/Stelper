angular.module('app').service('actionService',['jwtHelper','$q','$window', function(jwtHelper, $q, $window) {

    'use strict';

    /**
     * Taking the window navigator geolocation and returns the users current position
     *
     * @returns {*|promise} Expects to be called with .then(successfkt, errorfkt)
     */
    this.getCurrentPosition = function () {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        } else {
            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
                    deferred.reject(err);
                });
        }

        return deferred.promise;
    };

    /**
     * Takes the token and checks for expiration date.
     *
     * @param token String containing base64 payload
     * @returns {boolean} Check for undefined, null and expiration date
     */
    this.checkLoginState = function (token) {
        // If a value is false then continue check else return !true === false
        return !(token === 'undefined' || token === null || jwtHelper.isTokenExpired(token));
    };

    this.getCurrentId = function (token) {
        var tok = jwtHelper.decodeToken(token);
        return tok.sub;
    }

}]);
