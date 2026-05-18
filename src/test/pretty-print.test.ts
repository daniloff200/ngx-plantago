import * as assert from 'assert';
import { printString } from '../lib/pretty-print';

describe('printString', () => {

    it('should format valid TypeScript code', () => {
        const input = 'const x:string="hello";';
        const result = printString(input);
        // prettier should add spaces and proper formatting
        assert.ok(result.includes('const x'), 'Should contain the variable declaration');
        assert.ok(result.includes("'hello'"), 'Should use single quotes per config');
    });

    it('should return original code when formatting fails', () => {
        // This is intentionally broken syntax that prettier cannot parse
        const broken = '{{{{invalid typescript code {{{ %%%';
        const result = printString(broken);
        assert.strictEqual(result, broken);
    });

    it('should use single quotes', () => {
        const input = 'const x = "hello";';
        const result = printString(input);
        assert.ok(result.includes("'hello'"), 'Should convert double quotes to single quotes');
    });
});