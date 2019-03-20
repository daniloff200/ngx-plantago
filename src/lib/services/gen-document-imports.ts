import { uniq, sortBy } from 'lodash';
import { FileContent } from '../models/file-content';

const needToSkip = ['$q', '$log', '$filter', '$rootScope', '$timeout', '$cacheFactory', '$state'];

export function genDocumentImports(document: FileContent): any {
    let results: string[] = [];

    const importsAngular = [];

    switch (document.type) {
        case 'service':
        case 'factory':
            importsAngular.push('Injectable');
            break;

        case 'component':
            importsAngular.push('Component');
            break;
        
        case 'filter':
            importsAngular.push('Pipe, PipeTransform');
            break;
    }

    const documentInjects = document.constructor.dependencies
        .filter(item => needToSkip.indexOf(item) === -1);

    if (document.lifecycleHooks && document.lifecycleHooks.length > 0) {
        importsAngular.push(...document.lifecycleHooks as string[]);
    }

    const elementIndex = documentInjects.indexOf('$element');
    if (elementIndex !== -1) {
        importsAngular.push('ElementRef');
        documentInjects.splice(elementIndex, 1);
    }

    results.push(`import { ${importsAngular.join(', ')} } from '@angular/core';`);

    const httpIndex = documentInjects.indexOf('$http');
    if (httpIndex !== -1) {
        documentInjects.splice(httpIndex, 1);
        documentInjects.push('HttpClient');
    }

    if (documentInjects && documentInjects.length > 0) {
        documentInjects.forEach(item => {
            if (item === 'HttpClient') {
                results.push('import { HttpClient, HttpHeaders, HttpParams } from \'@angular/common/http\';');
                return;
            }

            results.push(`import { ${item} } from './';`);
        });
    }

    results = sortBy(uniq(results));

    return { imports: results.join('\n'), dependencies: documentInjects };
}
