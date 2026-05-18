import * as assert from 'assert';
import * as ts from 'typescript';
import { getImports } from '../lib/get-imports';

function parse(code: string): ts.SourceFile {
    return ts.createSourceFile('test.ts', code, ts.ScriptTarget.ES2015, true);
}

describe('getImports', () => {

    it('should extract import statements', () => {
        const code = `
            import { Component } from '@angular/core';
            import { HttpClient } from '@angular/common/http';
            const x = 1;
        `;
        const result = getImports(parse(code));
        assert.strictEqual(result.length, 2);
        assert.ok(result[0].includes('@angular/core'));
        assert.ok(result[1].includes('@angular/common/http'));
    });

    it('should return empty array when no imports', () => {
        const code = `const x = 1;`;
        const result = getImports(parse(code));
        assert.strictEqual(result.length, 0);
    });

    it('should handle default imports', () => {
        const code = `import lodash from 'lodash';`;
        const result = getImports(parse(code));
        assert.strictEqual(result.length, 1);
        assert.ok(result[0].includes('lodash'));
    });
});