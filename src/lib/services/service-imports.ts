import { SourceFile } from 'typescript';
import { uniq, sortBy } from 'lodash';

import { getImports } from '../get-imports';

const needToSkip = ['$q', '$log', '$filter', '$rootScope', '$timeout'];

export function serviceImports(service: { serviceInjects: string[]; }): any {
    let results: string[] = [];

    const importsAngular = [];
    const serviceInjects = service.serviceInjects
        .filter(item => needToSkip.indexOf(item) === -1);

    importsAngular.push('Injectable');

    const elementIndex = serviceInjects.indexOf('$element');
    if (elementIndex !== -1) {
        importsAngular.push('ElementRef');
        serviceInjects.splice(elementIndex, 1);
    }

    results.push(`import { ${importsAngular.join(', ')} } from '@angular/core';`);

    const httpIndex = serviceInjects.indexOf('$http');
    if (httpIndex !== -1) {
        serviceInjects.splice(httpIndex, 1);
        serviceInjects.push('HttpClient');
    }

    if (serviceInjects && serviceInjects.length > 0) {
        serviceInjects.forEach(item => {
            if (item === 'HttpClient') {
                results.push('import { HttpClient, HttpHeaders, HttpParams } from \'@angular/common/http\';');
                return;
            }

            results.push(`import { ${item} } from './';`);
        });
    }

    results = sortBy(uniq(results));

    return { imports: results.join('\n'), serviceInjects };
}
