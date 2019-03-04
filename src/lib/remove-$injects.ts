import * as ts from 'typescript';
import { SourceFile } from 'typescript';

const kind = ts.SyntaxKind;

export function remove$Injects(ast: SourceFile) {
  ast.statements.filter(s => s.kind === kind.FunctionDeclaration).forEach((c: any) => {
    c.members = c.members.filter((m: any) => {
      if (!m.name) {
        return true;
      }

      return m.name.text !== '$inject';
    });
  });

  return ast;
}
