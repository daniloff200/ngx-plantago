import { Uri } from 'vscode';
import { readFileSync } from 'fs';
import * as ts from 'typescript';

export function getSourceFile(file: Uri): ts.SourceFile {
    return ts.createSourceFile(file.path, readFileSync(file.path).toString(), ts.ScriptTarget.ES2015, true);
}
