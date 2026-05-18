/**
 * Example: AngularJS component with $onDestroy lifecycle hook.
 * Tests: lifecycle hooks, $onInit + $onDestroy, $element.
 */
angular.module('app.components')
    .component('modalDialog', {
        templateUrl: 'modal-dialog.html',
        controller: ModalDialogController,
        bindings: {
            title: '<',
            isOpen: '<',
            onClose: '&'
        }
    });

ModalDialogController.$inject = ['$element', '$timeout'];

function ModalDialogController($element, $timeout) {
    var ctrl = this;

    ctrl.animating = false;

    ctrl.$onInit = function () {
        ctrl.animating = false;
    };

    ctrl.$onDestroy = function () {
        ctrl.cleanup();
    };

    ctrl.close = function () {
        ctrl.animating = true;
        $timeout(function () {
            ctrl.animating = false;
            ctrl.onClose();
        }, 300);
    };

    ctrl.cleanup = function () {
        ctrl.animating = false;
    };
}