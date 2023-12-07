export const mockBlogModel = {
  id: '',
  name: '',
  description: '',
  websiteUrl: '',
  createdAt: '',
  isMembership: false,
};

export const mockUserModel = {
  id: '',
  login: '',
  email: '',
  createdAt: '',
};

export const mockPostModel = {
  id: '',
  title: '',
  shortDescription: '',
  content: '',
  blogId: '',
  createdAt: '',
  blogName: '',
};

export const mockGameModel = {
  id: '',
  status: '',
  pairCreatedDate: '',
  startGameDate: '',
  finishGameDate: '',
};

export const mockCommentModel = {
  id: '',
  content: '',
  commentatorInfo: {
    userId: '',
    userLogin: '',
  },
  createdAt: '',
};

export const mockQuestionModel = {
  id: '',
  body: '',
  correctAnswers: [],
  published: false,
  updatedAt: '',
  createdAt: '',
};

export const mockGetItems = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};
