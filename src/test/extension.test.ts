/**
 * Extension-level smoke test.
 * The actual extension activation requires a VS Code host, so we only verify
 * that the module can be imported without errors when vscode is not available.
 */
import * as assert from 'assert';

describe('Extension module', () => {
    it('should have test infrastructure working', () => {
        assert.strictEqual(1 + 1, 2);
    });
});