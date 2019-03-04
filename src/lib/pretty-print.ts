import * as prettier from 'prettier';
import { SourceFile } from 'typescript';

import { renderSourceFile } from './render-source-file';

export function printAst(ast: SourceFile) {
    let code = renderSourceFile(ast);
    return printString(code);
}

export function printString(code: string): string {
    // Now we run the code through prettier
    code = prettier.format(code, {
        parser: 'typescript',
        printWidth: 140,
        tabWidth: 4,
        singleQuote: true,
        trailingComma: "all"
    });

    return code;
}
