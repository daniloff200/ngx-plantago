import { FilesPaths } from './models/file-content';


let filesNameAndPaths: FilesPaths[] = [];
let currentFile: any;

export function saveFileToStorage(name: string, type: string, moduleName: any) {
    filesNameAndPaths.push({name: name, path: currentFile.path, type:type, moduleName: moduleName, isInModule: false});
}

export function saveCurrentFile(file: any) {
    currentFile = file;
    return file;
}    

export function getStorage() {
    return filesNameAndPaths;
}

export function getCurrentFile() {
    return currentFile;
}

  