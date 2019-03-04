import * as ts from 'typescript';
import { SourceFile } from 'typescript';

const kind = ts.SyntaxKind;

export function getImports(ast: SourceFile) {
    const results: string[] = [];

    ast.statements.filter(x => x.kind === kind.ImportDeclaration).forEach(i => {
        let importText = ast.text.slice(i.pos, i.end);

        // There is a new line that needs to be trimmed off
        results.push(importText.trim());
    });

    return results;
}
