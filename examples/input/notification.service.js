/**
 * Example: AngularJS service with $interval and $timeout.
 * Tests: $interval -> setInterval, $timeout -> setTimeout, timer cancellation.
 */
angular.module('app.services')
    .service('NotificationService', ['$timeout', '$interval', '$log', function ($timeout, $interval, $log) {

        var self = this;

        self.notifications = [];
        self.pollTimer = null;

        self.addNotification = function (message, type) {
            var notification = {
                message: message,
                type: type || 'info',
                timestamp: new Date()
            };

            self.notifications.push(notification);
            $log.info('Notification added: ' + message);

            $timeout(function () {
                self.removeNotification(notification);
            }, 5000);
        };

        self.removeNotification = function (notification) {
            var index = self.notifications.indexOf(notification);
            if (index > -1) {
                self.notifications.splice(index, 1);
            }
        };

        self.startPolling = function () {
            self.pollTimer = $interval(function () {
                $log.debug('Polling for new notifications...');
                self.checkForUpdates();
            }, 30000);
        };

        self.stopPolling = function () {
            if (self.pollTimer) {
                $interval.cancel(self.pollTimer);
                self.pollTimer = null;
            }
        };

        self.checkForUpdates = function () {
            $log.debug('Checking for updates');
        };
    }]);