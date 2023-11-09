export const errorsConstants = {
  blog: {
    name: 'name should be a string and contains at least 1 but not more than 15 characters',
    description:
      'description should be a string and contains at least 1 but not more than 500 characters',
    websiteUrl: 'websiteUrl should be a string and be in URL format',
  },
  post: {
    title:
      'title should be a string and contains at least 1 but not more than 30 characters',
    shortDescription:
      'shortDescription should be a string and contains at least 1 but not more than 100 characters',
    content:
      'content should be a string and contains at least 1 but not more than 1000 characters',
    blogId: 'such blog must exist',
  },
  user: {
    login:
      'login should be a string and contains at least 3 but not more than 10 characters',
    password:
      'password should be a string and contains at least 6 but not more than 20 characters',
    email: 'email should be a string and valid',
  },
  login: {
    loginOrEmail: 'loginOrEmail should be a string',
    password: 'password should be a string',
  },
  comment: {
    content:
      'Content should be a string and contains at least 20 but not more than 300 characters',
  },
};
