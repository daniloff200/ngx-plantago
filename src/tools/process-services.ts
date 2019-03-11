import * as path from 'path';
import * as ts from 'typescript';
import { Uri } from 'vscode';
import { getSourceFile } from '../lib/get-source-file';
import { serviceImports } from '../lib/services/service-imports';
import { processStringReplacements } from '../lib/process-string-replacements';
import { printString } from '../lib/pretty-print';
import { getOutputFilePath } from '../lib/get-output-file-path';

import { writeFile } from '../lib/write-file';
import { getServiceData } from '../lib/services/get-service-data';

export function processServices(files: Uri[]) {
  files.forEach(file => {
    console.log(`Processing: ${path.basename(file.path)}`);

    // Read and parse the file's code
    let ast = getSourceFile(file);

    const service = getServiceData(ast);

    // Let do some stuff before we start modifying the AST
    const serviceImportsRes = serviceImports(service);
    const imports = serviceImportsRes.imports;
    service.serviceInjects = serviceImportsRes.serviceInjects;

    // Now we are modifying the AST

    // Remove all the $injects
    // ast = remove$Injects(ast);

    // Remove the existing imports
    // ast = removeImports(ast);

    // Remove $q, $timeout and $interval from the constructor
    // ast = removeFromConstructor(ast, ['$q', '$timeout', '$interval']);

    let code = `${imports}${'\n'}
    @Injectable()
    export class ${service.serviceName} {
      ${service.declarationVariables}${'\n'}
      ${genConstructor(service.serviceInjects, service.constructorInit)}${'\n'}
      ${syncInjectsVariables(service.serviceInjects, service.variables, service.serviceMethods)}
    }`;

    // Do a bunch of string replacements
    code = processStringReplacements(code);

    // Try and clean up the formatting some
    code = printString(code);

    // Write it out
    const outputFilePath = getOutputFilePath(file);
    writeFile(outputFilePath, code);

    console.log(`    Created: ${path.basename(outputFilePath)}\n`);
  });

  console.log(`Converted ${files.length} models/services.\n\n`);
}

function genConstructor(injects: string[], constructorInit: string) {
  let contructorInjects: string = '';

  injects.forEach(item => {
    contructorInjects += `private ${camelize(item)}: ${item},${'\n'}`;
  });

  return `constructor(${contructorInjects}) {${constructorInit}}`;
}

function camelize(str: string) {
  if (['$rootScope', '$filter'].indexOf(str) !== -1) {
    return str;
  }

  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter: string, index: number) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function syncInjectsVariables(injects: string[], variables: string[], results: string) {
  const replacements: [RegExp, string][] = [];

  injects.forEach(item => {
    replacements.push([new RegExp(`\\b${item}\\b`, 'g'), `this.${camelize(item)}`]);
  });

  variables.forEach(item => {
    replacements.push([new RegExp(`(?<!(function|:|this.|$this.) )\\b${item}\\b((?!\s*\((.*)\))(?!\s*\{)|(\s*\((.*)\))(?!\s*\{))`, 'g'), `this.${item}`]);
  });

  for (const r of replacements) {
    results = results.replace(r[0], r[1]);
  }

  return results;
}