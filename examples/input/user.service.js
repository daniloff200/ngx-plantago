/**
 * Example: AngularJS service with $http and $q dependencies.
 * Tests: DI annotation, promise migration, $http -> HttpClient.
 */
angular.module('app.services')
    .service('UserService', ['$http', '$q', function ($http, $q) {

        var self = this;

        self.users = [];

        self.getUsers = function () {
            var deferred = $q.defer();

            $http.get('/api/users').then(function success(response) {
                self.users = response.data;
                deferred.resolve(response.data);
            }, function error(err) {
                $log.error('Failed to load users');
                deferred.reject(err);
            });

            return deferred.promise;
        };

        self.getUserById = function (id) {
            return $http.get('/api/users/' + id).then(function (response) {
                return response.data;
            });
        };

        self.createUser = function (userData) {
            return $http.post('/api/users', userData);
        };

        self.deleteUser = function (id) {
            return $http.delete('/api/users/' + id);
        };
    }]);