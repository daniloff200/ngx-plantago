import { uniq, sortBy } from 'lodash';
import { FileContent } from '../models/file-content';
import { getStorage, getCurrentFile} from '../../lib/file-paths-storage';
import * as path from 'path';

const needToSkip = ['$q', '$log', '$filter', '$rootScope', '$timeout', '$cacheFactory', '$state'];

export function genDocumentImports(document: FileContent): any {
    let pathsStorage = getStorage();

    sortBy(pathsStorage,'moduleName');

    let currentActiveFile = getCurrentFile();
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

          pathsStorage.forEach((fileInfo) => {
          if (fileInfo.name === item) {
            const TSpath = path.relative(currentActiveFile.path, fileInfo.path).replace('../','').replace('.js','');
            results.push(`import { ${item} } from '${TSpath}';`);
            }
          });
        });
    }

    results = sortBy(uniq(results));
    return { imports: results, dependencies: documentInjects };
}