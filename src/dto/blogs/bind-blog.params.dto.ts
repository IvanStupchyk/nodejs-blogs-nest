import { isBlogExist } from '../../utils/decorators/existing-blog.decorator';
import { isUserExist } from '../../utils/decorators/existing-user.decorator';
import { isBlogHasOwner } from '../../utils/decorators/bind-blog-with-user.decorator';

export class BindBlogParamsDto {
  @isBlogExist({
    message: 'such blog should exist',
  })
  // @isBlogHasOwner({
  //   message: 'blog has already bind to the user',
  // })
  id: string;

  @isUserExist({
    message: 'user does not exist',
  })
  userId: string;
}
