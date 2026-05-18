import * as assert from 'assert';
import { replaceComponentsProps } from '../lib/templates/replace-component-props';

describe('replaceComponentsProps', () => {

    it('should transform attributes on custom elements to input bindings', () => {
        const input = '<my-widget title="hello"></my-widget>';
        const result = replaceComponentsProps(input);
        // Custom element attributes get wrapped with [] for inputs
        assert.ok(result.includes('[title]'), `Expected [title] binding, got: ${result}`);
    });

    it('should not transform attributes on standard HTML elements', () => {
        const input = '<div class="container"></div>';
        const result = replaceComponentsProps(input);
        assert.ok(result.includes('class="container"'), `Standard attrs should be unchanged, got: ${result}`);
    });

    it('should handle output bindings ($event)', () => {
        const input = '<my-widget on-close="$event.doClose()"></my-widget>';
        const result = replaceComponentsProps(input);
        // Attrs containing $event should become output bindings ()
        assert.ok(result.includes('(onClose)') || result.includes('(on-close)'), `Expected output binding, got: ${result}`);
    });

    it('should handle empty HTML gracefully', () => {
        const input = '<div></div>';
        const result = replaceComponentsProps(input);
        assert.ok(result.includes('<div>'), `Should preserve HTML, got: ${result}`);
    });

    it('should not modify already-bound attributes', () => {
        const input = '<my-widget [title]="name"></my-widget>';
        const result = replaceComponentsProps(input);
        // Already-bound attributes (with []) should not be double-wrapped
        assert.ok(!result.includes('[[title]]'), `Should not double-wrap, got: ${result}`);
    });
});