import { Injectable } from '@nestjs/common';
import { FilesSaveAdapter } from './filesSaveAdapter';
import { dirname, join } from 'node:path';
import { S3Adapter } from '../../../infrastructure/aws/s3.adapter';

@Injectable()
export class SaveUserAvatarUseCase {
  constructor(
    private filesSaveAdapter: FilesSaveAdapter,
    private s3Adapter: S3Adapter,
  ) {}
  async execute(
    userId: string,
    originalname: string,
    buffer: Buffer,
    mimetype: string,
  ) {
    //const userProfile = repo.getUserProfile(userId)

    // const path = `post/img/main/${userId}/${originalname}`;
    const path = `${originalname}`;
    await this.s3Adapter.uploadImage(path, buffer, mimetype);
    // await this.s3Adapter.deleteImage(path);
    // const { url, fileId } = await this.filesSaveAdapter.saveAvatar(
    //   userId,
    //   originalname,
    //   buffer,
    // );
    //
    // console.log('url', url);
    // console.log('fileId', fileId);
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
