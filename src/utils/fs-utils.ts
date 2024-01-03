import { existsSync, mkdirSync, readFile, writeFile } from 'node:fs';
import { join, dirname } from 'node:path';
export const readTextFileAsync = (relativePath: string) => {
  return new Promise((resolve, reject) => {
    const rootDirPath = dirname(require.main.filename);
    const filePath = join(rootDirPath.replace('src', ''), relativePath);

    readFile(filePath, { encoding: 'utf-8' }, (err, content) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      resolve(content);
    });
  });
};

export const saveFileAsync = (relativePath: string, data: Buffer) => {
  return new Promise<void>((resolve, reject) => {
    const rootDirPath = dirname(require.main.filename);
    const filePath = join(rootDirPath.replace('src', ''), relativePath);

    writeFile(filePath, data, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      resolve();
    });
  });
};

export const ensureDirSync = (relativePath: string): void => {
  const rootDirPath = dirname(require.main.filename);
  const dirPath = join(rootDirPath.replace('src', ''), relativePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
};
