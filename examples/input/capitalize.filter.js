/**
 * Example: AngularJS filter (becomes Angular Pipe).
 * Tests: filter -> @Pipe, return function -> transform method.
 */
angular.module('app.filters')
    .filter('capitalize', [function () {
        return function (input) {
            if (angular.isUndefined(input) || input === null) {
                return '';
            }
            return input.charAt(0).toUpperCase() + input.slice(1);
        };
    }]);