import { isBlogExist } from '../../../utils/decorators/existing-blog.decorator';
import { isUserExist } from '../../../utils/decorators/existing-user.decorator';

export class BindBlogParamsDto {
  @isBlogExist({
    message: 'such blog should exist',
  })
  id: string;

  @isUserExist({
    message: 'user does not exist',
  })
  userId: string;
}
