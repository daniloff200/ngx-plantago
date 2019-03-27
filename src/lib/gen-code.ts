import * as _ from 'lodash';
import pascalCase from 'pascal-case';
import { FileContent, Constructor, Variable, Method } from "./models/file-content";
import { camelize } from "./camelize";
import { genDocumentImports } from './services/gen-document-imports';
import { saveFileToStorage } from '../lib/file-paths-storage';

export function genCode(document: FileContent): string {

    // Let do some stuff before we start modifying the AST
    const serviceImportsRes = genDocumentImports(document);
    const imports = serviceImportsRes.imports;
    document.constructor.dependencies = serviceImportsRes.dependencies;

    // regex to synchronize methods and variables
    const regexSync = syncInjectsVariables(document.constructor.dependencies, document.variables, document.methods);

    // get document decorator
    const decorator = genDocumentDecorator(document);

    const variables = genVariables(document.variables);
    
    const angularImports = [];
    if (variables.indexOf('@Output') > -1) {
        angularImports.push('Output');
    }

    if (variables.indexOf('@Input') > -1) {
        angularImports.push('Input');
    }

    if (variables.indexOf('EventEmitter') > -1) {
        angularImports.push('EventEmitter');
    }

    imports.push(`import { ${angularImports.join(', ')} } from '@angular/core';`);

    return `${imports.join('\n')}${'\n'}
      ${decorator}
      ${variables}${'\n'}
      ${genConstructor(document.constructor, regexSync)}${'\n'}
      ${genMethods(document.methods, regexSync)}
    }`;
}

function genVariables(variables: Variable[]): string {
    return _.orderBy(variables, ['isPrivate']).map(item => {
        return `
        ${item.isInput ? '@Input()\n' : ''}
        ${item.isOutput ? '@Output()\n' : ''}
        ${item.isPrivate ? 'private ' : ''}${item.name}: ${item.type}${item.value ? ' = ' + item.value : ''};`;
    }).join('\n');
}

function genConstructor(constructor: Constructor, replacements: [RegExp, string][]): string {
    let contructorInjects: string = '';

    constructor.dependencies.forEach(item => {
        contructorInjects += `private ${camelize(item)}: ${item},${'\n'}`;
    });

    if (constructor.context) {
        for (const r of replacements) {
            constructor.context = constructor.context.replace(r[0], r[1]);
        }
    }

    return `constructor(${contructorInjects}) {${constructor.context ? constructor.context : ''}}`;
}

function genMethods(methods: Method[], replacements: [RegExp, string][]): string {
    return methods.map(method => {
        for (const r of replacements) {
            method.body = method.body.replace(r[0], r[1]);
        }

        return `${method.name}(${method.arguments.join(',')}) ${method.body}\n`;
    }).join('\n');
}

function syncInjectsVariables(dependencies: string[], variables: Variable[], methods: Method[]): [RegExp, string][] {
    const replacements: [RegExp, string][] = [];

    dependencies.forEach(item => {
        replacements.push([new RegExp(`\\b${item}\\b`, 'g'), `this.${camelize(item)}`]);
    });

    const methodsNames = methods.map(item => item.name);
    const variablesNames = variables.map(item => item.name);

    methodsNames.concat(variablesNames).forEach(item => {
        replacements.push([new RegExp(`(?<!(function.+|\\.|var\\s+|let\\s+|const\\s+|\\'\\s*))\\b${item}\\b(?!(\\s*\\:|\\s*\\=|.*\\)\\s*\\=\\>|\\bfunction\\b|.*\\)\\s*\\{))`, 'g'), `this.${item}`]);
    });

    return replacements;
}

function genDocumentDecorator(document: FileContent): string {
    let decorator: string = '';

    switch (document.type) {
        case 'service':
        case 'factory':
            decorator = genServiceDecorator(document);
            break;

        case 'component':
            decorator = genComponentDecorator(document);
            break;

        case 'filter':
            decorator = getPipeDecorator(document);
            break;
    }

    return decorator;
}

function genServiceDecorator(document: FileContent): string {
    const serviceDecorator = `@Injectable()
    export class ${pascalCase(document.declaredName as string)} {`;

    saveFileToStorage(pascalCase(document.declaredName as string), document.type, document.moduleName);

    return serviceDecorator;
}

function getPipeDecorator(document: FileContent): string {
    const pipeDecorator = `@Pipe({name: '${camelize(document.declaredName as string)}'})
    export class ${pascalCase(document.declaredName as string)} implements PipeTransform {`;

    saveFileToStorage(pascalCase(document.declaredName as string), document.type, document.moduleName);

    return pipeDecorator;
}

function genComponentDecorator(document: FileContent): string {
    let componentDecorator = `
    @Component({
      selector: '${document.component.selector || ''}',
      templateUrl: '${document.component.templateUrl || ''}',
      styleUrls: [${document.component.styleUrls.join(', ')}]
    })
    export class ${pascalCase(document.declaredName as string)}`;

    if (document.lifecycleHooks && document.lifecycleHooks.length) {
        componentDecorator += ` implements ${document.lifecycleHooks.join(', ')}`;
    }

    saveFileToStorage(pascalCase(document.declaredName as string), document.type, document.moduleName);

    return componentDecorator + ' {';
}
