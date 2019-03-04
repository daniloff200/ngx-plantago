import { SourceFile, createPrinter, NewLineKind } from 'typescript';

export function renderSourceFile(sourceFile: SourceFile) {
    const printer = createPrinter({
        newLine: NewLineKind.LineFeed
    });

    return printer.printFile(sourceFile);
}
