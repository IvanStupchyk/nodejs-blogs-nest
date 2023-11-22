import { Request } from 'express';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiRequestsRepository } from '../infrastructure/repositories/api-requests.repository';
import { v4 as uuidv4 } from 'uuid';

class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

@Injectable()
export class ApiRequestService {
  constructor(private readonly apiRequestsRepository: ApiRequestsRepository) {}

  async countRequest(req: Request): Promise<boolean> {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket.remoteAddress ?? '');

    await this.apiRequestsRepository.addAPIRequest({
      id: uuidv4(),
      ip,
      URL: req.originalUrl,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    const timestamp = new Date().getTime() - 10000;
    const filterDate = new Date(timestamp).toISOString();
    const count =
      await this.apiRequestsRepository.getCountApiRequestToOneEndpoint(
        req.originalUrl,
        ip,
        filterDate,
      );

    if (count > 5) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }
}
