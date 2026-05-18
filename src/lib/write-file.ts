import { writeFileSync, renameSync } from 'fs';
import { makeDirectoriesInPath } from './make-directories-in-path';

export function writeFile(path: string, text: string): void {
    const pos = path.lastIndexOf(".");
    // Replace file extension with .ts (substring replaces deprecated substr)
    const saveTo = path.substring(0, pos < 0 ? path.length : pos) + ".ts";

    makeDirectoriesInPath(path);
    renameSync(path, saveTo);
    writeFileSync(saveTo, text, { encoding: 'UTF-8' });
}
