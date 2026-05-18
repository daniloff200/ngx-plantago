/**
 * Example: AngularJS component with bindings and lifecycle hooks.
 * Tests: component decorator, bindings -> @Input/@Output, $onInit.
 */
angular.module('app.components')
    .component('dashboard', {
        templateUrl: 'dashboard.html',
        controller: DashboardController,
        bindings: {
            userId: '<',
            onLogout: '&'
        }
    });

DashboardController.$inject = ['UserService', '$timeout'];

function DashboardController(UserService, $timeout) {
    var ctrl = this;

    ctrl.userData = null;
    ctrl.isLoading = true;

    ctrl.$onInit = function () {
        ctrl.loadUser();
    };

    ctrl.loadUser = function () {
        ctrl.isLoading = true;
        UserService.getUserById(ctrl.userId).then(function (data) {
            ctrl.userData = data;
            ctrl.isLoading = false;
        });
    };

    ctrl.handleLogout = function () {
        ctrl.onLogout();
    };

    ctrl.refreshData = function () {
        $timeout(function () {
            ctrl.loadUser();
        }, 1000);
    };
}