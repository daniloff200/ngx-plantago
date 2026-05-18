/**
 * Example: AngularJS filter with multiple parameters.
 * Tests: filter migration with args -> PipeTransform.
 */
angular.module('app.filters')
    .filter('truncate', [function () {
        return function (input, length, suffix) {
            if (angular.isUndefined(input) || input === null) {
                return '';
            }
            if (angular.isUndefined(length)) {
                length = 100;
            }
            if (angular.isUndefined(suffix)) {
                suffix = '...';
            }
            if (input.length <= length) {
                return input;
            }
            return input.substring(0, length) + suffix;
        };
    }]);