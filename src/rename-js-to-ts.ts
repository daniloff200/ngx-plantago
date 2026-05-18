import { exec } from "child_process";
import { Uri } from "vscode";
import { rename } from "fs";

export function renameJsToTs(file: Uri) {
    const filePath = file.path;
    const pos = filePath.lastIndexOf(".");
    // Replace .js extension with .ts (substring replaces deprecated substr)
    const renameTo = filePath.substring(0, pos < 0 ? filePath.length : pos) + ".ts";

    rename(file.path, renameTo, err => {
        if ( err ) {
            console.log('ERROR: ' + err);
        }
    });
}
