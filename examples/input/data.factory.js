/**
 * Example: AngularJS factory.
 * Tests: factory -> @Injectable, $q.when, $q.reject.
 */
angular.module('app.services')
    .factory('DataFactory', ['$http', '$q', function ($http, $q) {

        var cache = {};

        this.fetchData = function (key) {
            if (angular.isDefined(cache[key])) {
                return $q.when(cache[key]);
            }

            return $http.get('/api/data/' + key).then(function (response) {
                cache[key] = response.data;
                return response.data;
            });
        };

        this.clearCache = function () {
            cache = {};
            return $q.resolve();
        };

        this.failGracefully = function () {
            return $q.reject('something went wrong');
        };
    }]);