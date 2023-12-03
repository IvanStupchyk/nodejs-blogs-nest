import { User } from '../entities/users/User.entity';
import { Post } from '../entities/posts/Post.entity';
import { Comment } from '../entities/comments/Comment.entity';
import { Blog } from '../entities/blogs/Blog.entity';
import { InvalidRefreshToken } from '../entities/users/Invalid-refresh-tokens.entity';
import { PostLike } from '../entities/posts/Post-like.entity';
import { CommentLike } from '../entities/comments/Comment-like.entity';
import { Device } from '../entities/devices/Device.entity';
import { Question } from '../entities/game/Question.entity';
import { Answer } from '../entities/game/Answer.entity';

export type EntitiesType =
  | User
  | Post
  | Comment
  | Blog
  | InvalidRefreshToken
  | PostLike
  | CommentLike
  | Device
  | Question
  | Answer;
