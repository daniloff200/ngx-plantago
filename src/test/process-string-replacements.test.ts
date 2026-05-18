import * as assert from 'assert';
import { processStringReplacements } from '../lib/process-string-replacements';

describe('processStringReplacements', () => {

    // --- Scope replacements ---
    it('should replace ctrl. with this.', () => {
        assert.strictEqual(processStringReplacements('ctrl.value'), 'this.value');
    });

    it('should replace self. with this.', () => {
        assert.strictEqual(processStringReplacements('self.doStuff()'), 'this.doStuff()');
    });

    it('should replace that. with this.', () => {
        assert.strictEqual(processStringReplacements('that.name'), 'this.name');
    });

    it('should replace svc. with this.', () => {
        assert.strictEqual(processStringReplacements('svc.getData()'), 'this.getData()');
    });

    // --- Variable replacements ---
    it('should replace var with let', () => {
        assert.strictEqual(processStringReplacements('var x'), 'let x');
    });

    // --- $q replacements (promises) ---
    it('should replace $q.when() with Promise.resolve()', () => {
        assert.strictEqual(processStringReplacements('$q.when()'), 'Promise.resolve()');
    });

    it('should replace $q.all with Promise.all', () => {
        assert.strictEqual(processStringReplacements('$q.all'), 'Promise.all');
    });

    it('should replace $q.resolve(x) with Promise.resolve(x)', () => {
        assert.strictEqual(processStringReplacements('$q.resolve(data)'), 'Promise.resolve(data)');
    });

    it('should replace $q.reject(x) with Promise.reject(x)', () => {
        assert.strictEqual(processStringReplacements('$q.reject(err)'), 'Promise.reject(err)');
    });

    it('should replace IPromise<T> with Promise<T>', () => {
        assert.strictEqual(processStringReplacements('IPromise<string>'), 'Promise<string>');
    });

    it('should replace ng.IPromise<T> with Promise<T>', () => {
        assert.strictEqual(processStringReplacements('ng.IPromise<string>'), 'Promise<string>');
    });

    // --- $log ---
    it('should replace $log with console', () => {
        assert.strictEqual(processStringReplacements('$log.info("test")'), 'console.info("test")');
    });

    // --- $timeout ---
    it('should replace $timeout.cancel(x) with clearTimeout(x)', () => {
        assert.strictEqual(processStringReplacements('$timeout.cancel(timer)'), 'clearTimeout(timer)');
    });

    it('should replace $timeout with setTimeout', () => {
        assert.strictEqual(processStringReplacements('$timeout(fn, 100)'), 'setTimeout(fn, 100)');
    });

    // --- $interval ---
    it('should replace $interval.cancel(x) with clearInterval(x)', () => {
        assert.strictEqual(processStringReplacements('$interval.cancel(timer)'), 'clearInterval(timer)');
    });

    it('should replace $interval with setInterval', () => {
        assert.strictEqual(processStringReplacements('$interval(fn, 1000)'), 'setInterval(fn, 1000)');
    });

    // --- angular utilities ---
    it('should replace angular.isDefined(x) with typeof check', () => {
        assert.strictEqual(processStringReplacements('angular.isDefined(val)'), 'typeof val !== "undefined"');
    });

    it('should replace angular.isUndefined(x) with typeof check', () => {
        assert.strictEqual(processStringReplacements('angular.isUndefined(val)'), 'typeof val === "undefined"');
    });

    it('should replace angular.isArray(x) with Array.isArray', () => {
        assert.strictEqual(processStringReplacements('angular.isArray(items)'), 'Array.isArray(items)');
    });

    // --- Arrow functions ---
    it('should replace .then(function(x) { with .then((x) => {', () => {
        const input = '.then(function handler(result) {';
        const result = processStringReplacements(input);
        assert.ok(result.includes('=>'), `Expected arrow function, got: ${result}`);
    });

    // --- Array types ---
    it('should replace Array<T> with T[]', () => {
        assert.strictEqual(processStringReplacements('Array<string>'), 'string[]');
    });

    // --- $http ---
    it('should replace $http: ng.IHttpService with http: HttpClient', () => {
        assert.strictEqual(processStringReplacements('$http: ng.IHttpService'), 'http: HttpClient');
    });

    it('should replace response.data with response', () => {
        assert.strictEqual(processStringReplacements('response.data'), 'response');
    });
});