angular.module('app').service('helperService',['$q','$window', function($q, $window) {

    'use strict';

    /**
     * Taking the window navigator geolocation and returns the users current position
     *
     * @returns {*|promise}
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

}]);
