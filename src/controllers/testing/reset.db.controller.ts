import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, Post } from '../../schemas/post.schema';
import { Blog, BlogDocument } from '../../schemas/blog.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { CommentDocument, Comment } from '../../schemas/comment.schema';
import { PostLikes, PostLikesDocument } from '../../schemas/post.likes.schema';
import { Device, DeviceDocument } from '../../schemas/device.schema';

@Controller()
export class ResetDbController {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(Device.name) private DeviceModel: Model<DeviceDocument>,
    @InjectModel(PostLikes.name)
    private PostLikesModel: Model<PostLikesDocument>,
  ) {}

  @Delete('testing/all-data')
  @HttpCode(204)
  async resetDb() {
    await this.PostModel.deleteMany();
    await this.BlogModel.deleteMany();
    await this.UserModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.PostLikesModel.deleteMany();
    await this.DeviceModel.deleteMany();
  }
}
