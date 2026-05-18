import * as assert from 'assert';
import { genCode } from '../lib/gen-code';
import { FileContent } from '../lib/models/file-content';
import { saveCurrentFile } from '../lib/file-paths-storage';

/**
 * Helper to create a minimal FileContent object for testing genCode.
 * Note: we use Object.assign instead of spread because FileContent has
 * a 'constructor' field which collides with JS Object.prototype.constructor.
 */
function makeFileContent(overrides: { [key: string]: any } = {}): FileContent {
    const base: FileContent = {
        type: 'service',
        moduleName: 'app.services',
        isMainModule: false,
        declaredName: 'myService',
        methods: [],
        variables: [],
        lifecycleHooks: [],
        component: { selector: '', templateUrl: '', styleUrls: [] },
        constructor: { dependencies: [], context: '' },
    };
    // Object.assign avoids the prototype 'constructor' collision
    return Object.assign(base, overrides);
}

describe('genCode', () => {

    // genCode internally calls saveFileToStorage which reads currentFile.path,
    // so we must set a fake current file before each test.
    beforeEach(() => {
        saveCurrentFile({ path: '/fake/test.service.js' });
    });

    it('should generate an @Injectable() decorator for a service', () => {
        const doc = makeFileContent({ type: 'service', declaredName: 'userService' });
        const code = genCode(doc);
        assert.ok(code.includes('@Injectable()'), `Expected @Injectable(), got: ${code}`);
        assert.ok(code.includes('export class UserService'), `Expected PascalCase class name, got: ${code}`);
    });

    it('should generate a @Component decorator for a component', () => {
        const doc = makeFileContent({
            type: 'component',
            declaredName: 'myWidget',
            component: { selector: 'my-widget', templateUrl: 'my-widget.html', styleUrls: ["'my-widget.css'"] }
        });
        const code = genCode(doc);
        assert.ok(code.includes('@Component'), `Expected @Component, got: ${code}`);
        assert.ok(code.includes("selector: 'my-widget'"), `Expected selector, got: ${code}`);
        assert.ok(code.includes("templateUrl: 'my-widget.html'"), `Expected templateUrl, got: ${code}`);
    });

    it('should generate a @Pipe decorator for a filter', () => {
        const doc = makeFileContent({ type: 'filter', declaredName: 'capitalize' });
        const code = genCode(doc);
        assert.ok(code.includes('@Pipe'), `Expected @Pipe, got: ${code}`);
        assert.ok(code.includes('PipeTransform'), `Expected PipeTransform, got: ${code}`);
    });

    it('should generate constructor with dependencies', () => {
        const doc = makeFileContent({
            type: 'service',
            declaredName: 'apiService',
            constructor: { dependencies: ['HttpClient'], context: '' }
        });
        const code = genCode(doc);
        assert.ok(code.includes('constructor('), `Expected constructor, got: ${code}`);
        assert.ok(code.includes('HttpClient'), `Expected HttpClient in constructor, got: ${code}`);
    });

    it('should generate methods', () => {
        const doc = makeFileContent({
            type: 'service',
            declaredName: 'testService',
            methods: [
                { name: 'getData', arguments: ['id'], body: '{ return id; }' }
            ]
        });
        const code = genCode(doc);
        assert.ok(code.includes('getData(id)'), `Expected getData method, got: ${code}`);
    });

    it('should generate variables with @Input and @Output decorators', () => {
        const doc = makeFileContent({
            type: 'component',
            declaredName: 'testComp',
            variables: [
                { name: 'title', type: 'any', value: null, isPrivate: false, isInput: true },
                { name: 'onClose', type: 'EventEmitter<any>', value: 'new EventEmitter<any>()', isPrivate: false, isOutput: true }
            ]
        });
        const code = genCode(doc);
        assert.ok(code.includes('@Input()'), `Expected @Input(), got: ${code}`);
        assert.ok(code.includes('@Output()'), `Expected @Output(), got: ${code}`);
    });

    it('should include angular imports for Input/Output/EventEmitter', () => {
        const doc = makeFileContent({
            type: 'component',
            declaredName: 'testComp',
            variables: [
                { name: 'title', type: 'any', value: null, isPrivate: false, isInput: true },
                { name: 'onClose', type: 'EventEmitter<any>', value: 'new EventEmitter<any>()', isPrivate: false, isOutput: true }
            ]
        });
        const code = genCode(doc);
        assert.ok(code.includes("from '@angular/core'"), `Expected angular/core import, got: ${code}`);
    });

    it('should handle lifecycle hooks (implements clause)', () => {
        const doc = makeFileContent({
            type: 'component',
            declaredName: 'myComp',
            lifecycleHooks: ['OnInit', 'OnDestroy']
        });
        const code = genCode(doc);
        assert.ok(code.includes('implements OnInit, OnDestroy'), `Expected implements clause, got: ${code}`);
    });
});