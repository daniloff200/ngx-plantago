import * as assert from 'assert';
import { dashToCamel } from '../lib/dash-to-camel';

describe('dashToCamel', () => {
    it('should convert dash-case to camelCase', () => {
        assert.strictEqual(dashToCamel('my-component'), 'myComponent');
    });

    it('should leave camelCase strings unchanged', () => {
        assert.strictEqual(dashToCamel('myComponent'), 'myComponent');
    });

    it('should handle multiple dashes', () => {
        assert.strictEqual(dashToCamel('my-long-component-name'), 'myLongComponentName');
    });

    it('should return empty string for empty input', () => {
        assert.strictEqual(dashToCamel(''), '');
    });

    it('should handle single word without dashes', () => {
        assert.strictEqual(dashToCamel('component'), 'component');
    });
});