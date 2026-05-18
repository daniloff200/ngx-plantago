import { Pipe, PipeTransform } from '@angular/core';
import {} from '@angular/core';

@Pipe({ name: 'capitalize' })
export class Capitalize implements PipeTransform {
    constructor() {}

    transform(input) {
        return input => {
            if (typeof input === 'undefined' || input === null) {
                return '';
            }
            return input.charAt(0).toUpperCase() + input.slice(1);
        };
    }
}
