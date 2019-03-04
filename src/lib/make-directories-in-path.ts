import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

export function makeDirectoriesInPath(filePath: string): void {
  const dirname = path.dirname(filePath);

  if (existsSync(dirname)) {
    return;
  }

  makeDirectoriesInPath(dirname);

  mkdirSync(dirname);
}
