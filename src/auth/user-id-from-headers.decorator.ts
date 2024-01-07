import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
export const UserIdFromHeaders = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    let userId;
    if (request.headers?.authorization) {
      const accessToken = request.headers?.authorization.split(' ')[1];
      const jwtService = new JwtService();
      userId = jwtService.decode(accessToken);
    }

    return userId?.userId;
  },
);
