import { BadRequestException } from "@nestjs/common";

type ErrorType = {
  field: string;
  message: string;
};

export const errorMessageGenerator = (error: Array<ErrorType>) => {
  throw new BadRequestException({
    message: error,
  });
};
