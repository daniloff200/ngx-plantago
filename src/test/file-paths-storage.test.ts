import * as assert from 'assert';
import { saveFileToStorage, saveCurrentFile, getStorage, getCurrentFile } from '../lib/file-paths-storage';

describe('file-paths-storage', () => {

    // Note: this module uses module-level state, so tests run in order.

    it('should save and retrieve the current file', () => {
        const fakeFile = { path: '/src/app/my.service.js' };
        saveCurrentFile(fakeFile);
        assert.deepStrictEqual(getCurrentFile(), fakeFile);
    });

    it('should save a file entry to storage', () => {
        const fakeFile = { path: '/src/app/my.service.js' };
        saveCurrentFile(fakeFile);
        saveFileToStorage('MyService', 'service', 'app.services');

        const storage = getStorage();
        const last = storage[storage.length - 1];
        assert.strictEqual(last.name, 'MyService');
        assert.strictEqual(last.type, 'service');
        assert.strictEqual(last.moduleName, 'app.services');
        assert.strictEqual(last.path, '/src/app/my.service.js');
        assert.strictEqual(last.isInModule, false);
    });

    it('should accumulate multiple entries', () => {
        const initialLength = getStorage().length;

        saveCurrentFile({ path: '/src/app/other.component.js' });
        saveFileToStorage('OtherComponent', 'component', 'app.components');

        assert.strictEqual(getStorage().length, initialLength + 1);
    });
});