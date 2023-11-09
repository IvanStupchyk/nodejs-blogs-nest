import { PostsLikesInfoType } from '../../../types/postsLikesTypes';
import { PostLikesType } from '../../../dtos/post.likes.dto';
import { PostType } from '../../../domains/posts/dto/post.dto';
import { likeStatus } from '../../../types/generalTypes';
import { PostViewModel } from '../../../controllers/posts/models/PostViewModel';
import { ObjectId } from 'mongodb';

export const getPostsMapper = (
  posts: Array<PostType>,
  usersPostsLikes: Array<PostLikesType> | null,
): Array<PostViewModel> => {
  return posts.map((post) => {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus:
          usersPostsLikes?.find((up: PostsLikesInfoType) =>
            new ObjectId(up.postId).equals(post.id),
          )?.myStatus ?? likeStatus.None,
        newestLikes: post.extendedLikesInfo.newestLikes
          .sort(
            (a: any, b: any) =>
              new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf(),
          )
          .slice(0, 3)
          .map((l) => {
            return {
              login: l.login,
              userId: l.userId,
              addedAt: l.addedAt,
            };
          }),
      },
    };
  });
};
