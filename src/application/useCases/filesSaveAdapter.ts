import { Injectable } from '@nestjs/common';
import { join } from 'node:path';
import { ensureDirSync, saveFileAsync } from '../../utils/fs-utils';
import { SaveFileResultType } from './saveUserAvatarUseCase';
import { unlink } from 'node:fs';
@Injectable()
export class FilesSaveAdapter {
  async saveAvatar(
    userId: string,
    originalname: string,
    buffer: Buffer,
  ): Promise<SaveFileResultType> {
    const dirPath = join('content', 'users', userId, 'avatars');

    ensureDirSync(dirPath);
    const relativePath = join(dirPath, originalname);
    await saveFileAsync(relativePath, buffer);

    return {
      url: `content/users/${userId}/avatars/${originalname}`,
      fileId: relativePath,
    };
  }

  async deleteAvatar(fileId: string) {
    unlink(fileId, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
