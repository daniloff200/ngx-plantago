/**
 * Example: AngularJS component with inline array DI.
 * Tests: inline DI, $q.all, angular.isArray.
 */
angular.module('app.components')
    .component('userList', {
        templateUrl: 'user-list.html',
        controller: UserListController,
        bindings: {
            filter: '<',
            onSelect: '&'
        }
    });

function UserListController(UserService, $q) {
    var ctrl = this;

    ctrl.users = [];
    ctrl.selected = null;

    ctrl.$onInit = function () {
        ctrl.fetchAll();
    };

    ctrl.fetchAll = function () {
        $q.all([UserService.getUsers(), UserService.getAdmins()]).then(function (results) {
            if (angular.isArray(results[0])) {
                ctrl.users = results[0].concat(results[1]);
            }
        });
    };

    ctrl.selectUser = function (user) {
        ctrl.selected = user;
        ctrl.onSelect({ $event: user });
    };
}

UserListController.$inject = ['UserService', '$q'];