import { ValidateDtoFields } from './validate-dto-fields';
import { errorMessageGenerator } from './error-message-generator';

export const dtoExceptionsValidation = (dtoName: string, dto: any) => {
  const validate = new ValidateDtoFields();
  const notes = validate[dtoName](dto);

  if (notes.hasError()) {
    errorMessageGenerator(
      notes.messages.map((er) => {
        return {
          field: er.key,
          message: er.message,
        };
      }),
    );
  }
};
