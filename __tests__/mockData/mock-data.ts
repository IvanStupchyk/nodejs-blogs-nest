import { UserInputDto } from '../../src/application/dto/users/user.input.dto';
import { BlogInputDto } from '../../src/application/dto/blogs/blog.input.dto';
import { PostInputDto } from '../../src/application/dto/posts/post.input.dto';
import { v4 as uuidv4 } from 'uuid';
import { QuestionInputDto } from '../../src/application/dto/question/question.input.dto';

export const invalidUserData = {
  login: '',
  password: '',
  email: '',
};

export const userData1: UserInputDto = {
  login: 'Ivan',
  password: '123456',
  email: 'ivanIvan@gmail.com',
};

export const userData2: UserInputDto = {
  login: 'Sergey',
  password: '123456',
  email: 'ser@gmail.com',
};

export const userData3: UserInputDto = {
  login: 'Andrey',
  password: '123456',
  email: 'ser@gmail.com',
};

export const invalidBlogData: BlogInputDto = {
  name: '',
  description: '',
  websiteUrl: '',
};

export const invalidPostData: PostInputDto = {
  title: '',
  content: '',
  blogId: '',
  shortDescription: '',
};

export const validBlogData: BlogInputDto = {
  name: 'new name',
  description: 'new description',
  websiteUrl: 'https://www.aaaaa.com',
};

export const validPostData: PostInputDto = {
  title: 'title',
  content: 'content',
  blogId: uuidv4(),
  shortDescription: 'shortDescription',
};

export const validQuestionData: QuestionInputDto = {
  body: 'what is the main goal in the live?',
  correctAnswers: ['joy'],
};
