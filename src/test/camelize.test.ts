import * as assert from 'assert';
import { camelize } from '../lib/camelize';

describe('camelize', () => {
    it('should lowercase the first letter of a single word', () => {
        assert.strictEqual(camelize('Hello'), 'hello');
    });

    it('should convert space-separated words to camelCase', () => {
        assert.strictEqual(camelize('my service'), 'myService');
    });

    it('should handle already-camelCase strings', () => {
        assert.strictEqual(camelize('myService'), 'myService');
    });

    it('should handle PascalCase by lowering the first letter', () => {
        assert.strictEqual(camelize('MyService'), 'myService');
    });

    it('should return empty string for empty input', () => {
        assert.strictEqual(camelize(''), '');
    });
});