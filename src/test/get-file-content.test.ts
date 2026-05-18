import * as assert from 'assert';
import * as ts from 'typescript';
import { getFileContent } from '../lib/services/get-file-content';

/**
 * Helper: creates a TypeScript SourceFile AST from raw AngularJS code.
 * We use ES2015 parsing since that's what the extension uses.
 */
function parse(code: string): ts.SourceFile {
    return ts.createSourceFile('test.js', code, ts.ScriptTarget.ES2015, true);
}

describe('getFileContent', () => {

    it('should parse an AngularJS service', () => {
        const code = `
            angular.module('app.services')
                .service('UserService', ['$http', function($http) {
                    this.getUser = function(id) {
                        return $http.get('/api/users/' + id);
                    };
                }]);
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        assert.strictEqual(result!.type, 'service');
        assert.strictEqual(result!.declaredName, 'UserService');
        assert.strictEqual(result!.moduleName, 'app.services');
    });

    it('should parse an AngularJS factory', () => {
        const code = `
            angular.module('app.utils')
                .factory('DataFactory', [function() {
                    this.getData = function() {
                        return [];
                    };
                }]);
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        assert.strictEqual(result!.type, 'factory');
        assert.strictEqual(result!.declaredName, 'DataFactory');
    });

    it('should return undefined for config blocks', () => {
        const code = `
            angular.module('app')
                .config(['$routeProvider', function($routeProvider) {
                    $routeProvider.when('/home', { templateUrl: 'home.html' });
                }]);
        `;
        const result = getFileContent(parse(code));
        assert.strictEqual(result, undefined);
    });

    it('should parse an AngularJS component', () => {
        const code = `
            angular.module('app.components')
                .component('myWidget', {
                    templateUrl: 'my-widget.html',
                    controller: MyWidgetCtrl,
                    bindings: {
                        title: '<',
                        onClose: '&'
                    }
                });

            function MyWidgetCtrl() {
                this.doSomething = function() { return true; };
            }
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        assert.strictEqual(result!.type, 'component');
        assert.strictEqual(result!.declaredName, 'myWidget');
        assert.strictEqual(result!.component.templateUrl, 'my-widget.html');
    });

    it('should parse an AngularJS filter', () => {
        const code = `
            angular.module('app.filters')
                .filter('capitalize', [function() {
                    return function(input) {
                        return input.charAt(0).toUpperCase() + input.slice(1);
                    };
                }]);
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        assert.strictEqual(result!.type, 'filter');
        assert.strictEqual(result!.declaredName, 'capitalize');
    });

    it('should extract $inject dependencies', () => {
        const code = `
            angular.module('app')
                .service('ApiService', ApiService);

            ApiService.$inject = ['$http', '$q'];

            function ApiService($http, $q) {
                this.fetch = function() { return $http.get('/api'); };
            }
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        assert.ok(result!.constructor.dependencies.includes('$http'));
        assert.ok(result!.constructor.dependencies.includes('$q'));
    });

    it('should extract lifecycle hooks ($onInit)', () => {
        const code = `
            angular.module('app')
                .service('InitService', [function() {
                    this.$onInit = function() {
                        console.log('initialized');
                    };
                }]);
        `;
        const result = getFileContent(parse(code));
        assert.ok(result, 'Should return a FileContent object');
        // Lifecycle hooks get renamed: $onInit -> OnInit
        assert.ok(result!.lifecycleHooks.length > 0, 'Should have lifecycle hooks');
    });

    it('should return undefined for code with no angular type', () => {
        const code = `var x = 42;`;
        const result = getFileContent(parse(code));
        assert.strictEqual(result, undefined);
    });
});