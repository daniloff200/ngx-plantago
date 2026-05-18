/**
 * Example: AngularJS service with $inject annotation style.
 * Tests: $inject array, $timeout, $window, angular.isDefined.
 */
angular.module('app.services')
    .service('AuthService', AuthService);

AuthService.$inject = ['$http', '$window', '$timeout'];

function AuthService($http, $window, $timeout) {
    var svc = this;

    svc.token = null;
    svc.isAuthenticated = false;

    svc.login = function (credentials) {
        return $http.post('/api/auth/login', credentials).then(function (response) {
            svc.token = response.data.token;
            svc.isAuthenticated = true;
            $window.localStorage.setItem('auth_token', svc.token);
            return response.data;
        });
    };

    svc.logout = function () {
        svc.token = null;
        svc.isAuthenticated = false;
        $window.localStorage.removeItem('auth_token');
    };

    svc.checkToken = function () {
        var storedToken = $window.localStorage.getItem('auth_token');

        if (angular.isDefined(storedToken) && storedToken !== null) {
            svc.token = storedToken;
            svc.isAuthenticated = true;
        }
    };

    svc.scheduleTokenRefresh = function () {
        $timeout(function () {
            svc.refreshToken();
        }, 3600000);
    };

    svc.refreshToken = function () {
        return $http.post('/api/auth/refresh', { token: svc.token }).then(function (response) {
            svc.token = response.data.token;
            $window.localStorage.setItem('auth_token', svc.token);
            svc.scheduleTokenRefresh();
        });
    };
}