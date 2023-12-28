import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export const exceptionHandler = (
  code: HttpStatus,
  message?: string,
  field?: string,
) => {
  const exceptionObject = {
    message: [
      {
        message: message,
        field: field,
      },
    ],
  };

  switch (code) {
    case HttpStatus.BAD_REQUEST: {
      throw new BadRequestException(exceptionObject);
    }
    case HttpStatus.NOT_FOUND: {
      throw new NotFoundException(exceptionObject);
    }
    case HttpStatus.FORBIDDEN: {
      throw new ForbiddenException(exceptionObject);
    }
  }
};
