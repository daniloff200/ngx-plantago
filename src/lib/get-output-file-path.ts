import { Uri } from 'vscode';

export function getOutputFilePath(filePath: Uri) {
    let outputFileName = filePath.path;

    if (/src\/(data|img)/.test(outputFileName)) {
        outputFileName = outputFileName.replace('src', 'src/assets');
    }

    return outputFileName;
}
