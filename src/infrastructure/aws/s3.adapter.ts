import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as process from 'process';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadFile(key: string, buffer: Buffer, mimetype: string) {
    const command = new PutObjectCommand({
      Bucket: 'blogger-public',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    try {
      console.log(`Uploaded file to S3`);
      // const response = await this.s3Client.send(command);
      // console.log(response);
    } catch (err) {
      console.error(err);
    }
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: 'blogger-platform',
      Key: key,
    });

    try {
      console.log(`Deleted file to S3`);
      // const response = await this.s3Client.send(command);
      // console.log(response);
    } catch (err) {
      console.error(err);
    }
  }
}
