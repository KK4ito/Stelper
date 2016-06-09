angular.module('app').service('actionService',['jwtHelper','$q','$window', function(jwtHelper, $q, $window) {

    'use strict';
    
    // VARIABLES
    var service = this;
    
    // EXTERNAL METHODS

    /**
     * Taking the window navigator geolocation and returns the users current position
     *
     * @returns {*|promise} Expects to be called with .then(successfunc, errorfunc)
     */
    service.getCurrentPosition = function () {
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
     * The check is as follows:
     * If a value is false then continue check else return !true === false
     *
     * @param token String containing base64 payload
     * @returns {boolean} Check for undefined, null and expiration date
     */
    service.checkLoginState = function (token) {
        return !(token === 'undefined' || token === null || jwtHelper.isTokenExpired(token));
    };

    /**
     * Asks for the current id of a user by checking sub in token payload.
     * 
     * @param token String containing base64 payload
     * @returns {boolean|*|parsers.sub} return the json objects element sub (contains users id)
     */
    service.getCurrentId = function (token) {
        var tok = jwtHelper.decodeToken(token);
        console.log(tok);
        return tok.sub;
    };

}]);
