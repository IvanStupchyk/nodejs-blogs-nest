import { Injectable } from '@nestjs/common';
import { FilesSaveAdapter } from './filesSaveAdapter';
import { dirname, join } from 'node:path';

@Injectable()
export class SaveUserAvatarUseCase {
  constructor(private filesSaveAdapter: FilesSaveAdapter) {}
  async execute(userId: string, originalname: string, buffer: Buffer) {
    //const userProfile = repo.getUserProfile(userId)
    const { url, fileId } = await this.filesSaveAdapter.saveAvatar(
      userId,
      originalname,
      buffer,
    );

    console.log('url', url);
    console.log('fileId', fileId);
    // userProfile.updateAvatar(url, id)
    // repo.save(userProfile)

    // const rootDirPath = dirname(require.main.filename);
    // const filePath = join(rootDirPath.replace('src', ''), fileId);
    // console.log('filePath', filePath);
    // await this.filesSaveAdapter.deleteAvatar(filePath);
  }
}

export type SaveFileResultType = {
  url: string;
  fileId: string;
};
