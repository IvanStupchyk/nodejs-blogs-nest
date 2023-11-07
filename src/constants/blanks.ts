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

export const mockCommentModel = {
  id: '',
  content: '',
  commentatorInfo: {
    userId: '',
    userLogin: '',
  },
  createdAt: '',
};

export const mockBlogs = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};

export const mockPosts = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};

export const mockUsers = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};
