import { exec } from "child_process";
import { Uri } from "vscode";
import { rename } from "fs";

export function renameJsToTs(file: Uri) {
    const filePath = file.path;
    const pos = filePath.lastIndexOf(".");
    const renameTo = filePath.substr(0, pos < 0 ? filePath.length : pos) + ".ts";

    rename(file.path, renameTo, err => {
        if ( err ) {
            console.log('ERROR: ' + err);
        }
    });
}
