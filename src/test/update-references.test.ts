import * as assert from 'assert';
import { updateReferences } from '../lib/update-references';

describe('updateReferences', () => {

    it('should update shared/ imports to app/shared/', () => {
        const input = "import x from 'shared/services/my-service';";
        const expected = "import x from 'app/shared/services/my-service';";
        assert.strictEqual(updateReferences(input), expected);
    });

    it('should update modules/ imports to app/modules/', () => {
        const input = "import y from 'modules/dashboard';";
        const expected = "import y from 'app/modules/dashboard';";
        assert.strictEqual(updateReferences(input), expected);
    });

    it('should update img/ paths to assets/img/', () => {
        const input = "templateUrl: 'img/logo.png'";
        const expected = "templateUrl: 'assets/img/logo.png'";
        assert.strictEqual(updateReferences(input), expected);
    });

    it('should update data/ paths to assets/data/', () => {
        const input = "url: 'data/config.json'";
        const expected = "url: 'assets/data/config.json'";
        assert.strictEqual(updateReferences(input), expected);
    });

    it('should update src/img/ paths to assets/img/', () => {
        const input = "src: 'src/img/photo.jpg'";
        const expected = "src: 'assets/img/photo.jpg'";
        assert.strictEqual(updateReferences(input), expected);
    });

    it('should not modify unrelated paths', () => {
        const input = "import z from 'lodash';";
        assert.strictEqual(updateReferences(input), input);
    });
});