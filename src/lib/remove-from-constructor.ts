import * as ts from 'typescript';
import { SourceFile } from 'typescript';

const kind = ts.SyntaxKind;

export function removeFromConstructor(ast: SourceFile, parameterNames: string[]) {

  ast.statements.filter(s => s.kind === kind.FunctionDeclaration).forEach((c: any) => {
    const constructor = c.members.find((x: any) => x.kind === kind.Constructor);
    if (constructor) {
      constructor.parameters = constructor.parameters.filter((p: any) => {
        return parameterNames.indexOf(p.name.text) === -1;
      });

      if (constructor.parameters.find((x: any) => x.name.text === '$locationUtils')) {
        constructor.parameters = constructor.parameters.filter((p: any) => p.name.text !== '$routeParams');
      }
    }
  });

  return ast;
}
