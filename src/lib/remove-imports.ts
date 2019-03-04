import * as ts from 'typescript';

const kind = ts.SyntaxKind;

export function removeImports(ast: any) {
    ast.statements = ast.statements.filter((x: any) => x.kind !== kind.ImportDeclaration);

    return ast;
}
