import * as assert from 'assert';
import * as ts from 'typescript';
import { getBindings } from '../lib/get-bindings';

/**
 * Helper: parse TS/JS code that the getBindings function expects.
 * getBindings operates on a SourceFile that already has a class declaration
 * (i.e., after conversion to TS-like structure).
 */
function parse(code: string): ts.SourceFile {
    return ts.createSourceFile('test.ts', code, ts.ScriptTarget.ES2015, true);
}

describe('getBindings', () => {

    it('should return empty array when there is no class', () => {
        const code = `const x = 1;`;
        const result = getBindings(parse(code));
        assert.deepStrictEqual(result, []);
    });

    it('should return empty array when class has no bindings', () => {
        const code = `
            class MyComponent {
                name: string;
            }
        `;
        const result = getBindings(parse(code));
        assert.deepStrictEqual(result, []);
    });

    it('should parse input bindings (<)', () => {
        const code = `
            class MyComponent {
                bindings = {
                    title: '<',
                    count: '<'
                };
            }
        `;
        const result = getBindings(parse(code));
        assert.ok(result.length >= 2, `Expected at least 2 bindings, got ${result.length}`);
        const titleBinding = result.find((b: any) => b.name === 'title');
        assert.ok(titleBinding, 'Should find title binding');
        assert.strictEqual(titleBinding!.type, 'input');
    });

    it('should parse output bindings (&)', () => {
        const code = `
            class MyComponent {
                bindings = {
                    onClose: '&'
                };
            }
        `;
        const result = getBindings(parse(code));
        const onCloseBinding = result.find((b: any) => b.name === 'onClose');
        assert.ok(onCloseBinding, 'Should find onClose binding');
        assert.strictEqual(onCloseBinding!.type, 'output');
    });

    it('should parse two-way bindings (=)', () => {
        const code = `
            class MyComponent {
                bindings = {
                    value: '='
                };
            }
        `;
        const result = getBindings(parse(code));
        const valueBinding = result.find((b: any) => b.name === 'value');
        assert.ok(valueBinding, 'Should find value binding');
        assert.strictEqual(valueBinding!.type, 'two-way');
    });

    it('should detect optional bindings (?)', () => {
        const code = `
            class MyComponent {
                bindings = {
                    label: '<?'
                };
            }
        `;
        const result = getBindings(parse(code));
        const labelBinding = result.find((b: any) => b.name === 'label');
        assert.ok(labelBinding, 'Should find label binding');
        assert.strictEqual(labelBinding!.optional, true);
        assert.strictEqual(labelBinding!.type, 'input');
    });
});