import * as assert from 'assert';
import { camelToDash } from '../lib/camel-to-dash';

describe('camelToDash', () => {
    it('should convert camelCase to dash-case', () => {
        assert.strictEqual(camelToDash('myComponent'), 'my-component');
    });

    it('should convert PascalCase to dash-case', () => {
        assert.strictEqual(camelToDash('MyComponent'), '-my-component');
    });

    it('should leave already-dashed strings unchanged', () => {
        assert.strictEqual(camelToDash('my-component'), 'my-component');
    });

    it('should leave a single lowercase word unchanged', () => {
        assert.strictEqual(camelToDash('hello'), 'hello');
    });

    it('should handle multiple uppercase letters', () => {
        assert.strictEqual(camelToDash('myHTTPService'), 'my-h-t-t-p-service');
    });

    it('should return empty string for empty input', () => {
        assert.strictEqual(camelToDash(''), '');
    });
});