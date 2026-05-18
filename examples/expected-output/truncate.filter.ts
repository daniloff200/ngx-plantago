import { Pipe, PipeTransform } from '@angular/core';
import {} from '@angular/core';

@Pipe({ name: 'truncate' })
export class Truncate implements PipeTransform {
    constructor() {}

    transform(input, length, suffix) {
        return (input, length, suffix) => {
            if (typeof input === 'undefined' || input === null) {
                return '';
            }
            if (typeof length === 'undefined') {
                length = 100;
            }
            if (typeof suffix === 'undefined') {
                suffix = '...';
            }
            if (input.length <= length) {
                return input;
            }
            return input.substring(0, length) + suffix;
        };
    }
}
