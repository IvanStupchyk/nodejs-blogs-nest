import { HTTP_STATUSES, HttpStatusType } from '../../src/utils/utils';
import request from 'supertest';
import { UserInputDto } from '../../src/application/dto/users/user.input.dto';
import { RouterPaths } from '../../src/constants/router.paths';

export const usersTestManager = {
  async createUser(
    httpServer: string,
    data: UserInputDto,
    expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
    password = 'qwerty',
  ) {
    const response = await request(httpServer)
      .post(RouterPaths.users)
      .auth('admin', password, { type: 'basic' })
      .send(data)
      .expect(expectedStatusCode);

    let createdUser;

    if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
      createdUser = response.body;

      expect(createdUser).toEqual({
        id: expect.any(String),
        login: data.login,
        email: data.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
        },
      });
    }

    return { response, createdUser };
  },
};
