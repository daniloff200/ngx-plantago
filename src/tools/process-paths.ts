import * as path from 'path';
import pascalCase from 'pascal-case';

import { getSourceFile } from '../lib/get-source-file';
import { saveFileToStorage } from '../lib/file-paths-storage';
import { getFileContent } from '../lib/services/get-file-content';
import { FileContent } from '../lib/models/file-content';
import { saveCurrentFile } from '../lib/file-paths-storage';

export async function processPaths(file: any) {
    console.log(`Saving path for: ${path.basename(file.path)}`);

    saveCurrentFile(file);

    let ast = getSourceFile(file);

    const fileContent: FileContent | undefined = getFileContent(ast);

    if (!fileContent)
    {
      return file;
    }
    
    saveFileToStorage(pascalCase(fileContent.declaredName as string), fileContent.type, fileContent.moduleName);
}

