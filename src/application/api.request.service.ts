import { Request } from 'express';
import { ApiRequestRepository } from '../infrastructure/repositories/api.requests.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

@Injectable()
export class ApiRequestService {
  constructor(private readonly apiRequestRepository: ApiRequestRepository) {}

  async countRequest(req: Request): Promise<boolean> {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket.remoteAddress ?? '');

    await this.apiRequestRepository.addAPIRequest({
      ip,
      URL: req.originalUrl,
      date: new Date(),
    });

    const timestamp = new Date().getTime() - 10000;
    const filterDate = new Date(timestamp);
    const count =
      await this.apiRequestRepository.getCountApiRequestToOneEndpoint(
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
