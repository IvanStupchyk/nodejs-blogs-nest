export const errorsConstants = {
  post: {
    blogId: 'such blog must exist',
  },
  user: {
    uniqueLogin: 'Login should be unique',
  },
  recoveryCode: {
    recoveryCodeFirst: 'recoveryCode is incorrect',
    recoveryCodeSecond: 'hm, recoveryCode is incorrect',
  },
  login: {
    loginOrEmail: 'loginOrEmail should be a string',
    password: 'password should be a string',
  },
  likeStatus: 'status is incorrect',
  email: {
    uniqueEmail: 'Email should be unique',
    checkEmail: 'check your email again please',
  },
  confirmCode: {
    invalidCodeFirst: 'hm, code is invalid',
    invalidCodeSecond: 'something wrong with code',
  },
};
