import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import * as _ from 'lodash';

import { getSourceFile } from '../lib/get-source-file';
import { processStringReplacements } from '../lib/process-string-replacements';
import { printString } from '../lib/pretty-print';
import { getOutputFilePath } from '../lib/get-output-file-path';

import { writeFile } from '../lib/write-file';
import { getFileContent } from '../lib/services/get-file-content';
import { genCode } from '../lib/gen-code';
import { FileContent } from '../lib/models/file-content';

export async function processServices(files: Uri[]) {
  await Promise.all(files.map(async (file, index) => {
    // const pieces = file.path.split('/');
    // const fileName = pieces[pieces.length - 1];
    vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Start processing the "${path.basename(file.path)}" file`);
    console.log(`Processing: ${path.basename(file.path)} - (${index + 1}/${files.length})`);

    // Read and parse the file's code
    let ast = getSourceFile(file);

    // Read and parse the file's code
    const fileContent: FileContent = getFileContent(ast);

    // Now we are modifying the AST
    let code = genCode(fileContent);

    // Do a bunch of string replacements
    code = processStringReplacements(code);

    // Try and clean up the formatting some
    code = printString(code);

    // Write it out
    const outputFilePath = getOutputFilePath(file);
    writeFile(outputFilePath, code);

    vscode.window.showInformationMessage(`(${index + 1}/${files.length}): Finished processing the "${path.basename(file.path)}" file`);
    console.log(`Converted: ${path.basename(file.path)} - (${index + 1}/${files.length}):`);
  }));
}

