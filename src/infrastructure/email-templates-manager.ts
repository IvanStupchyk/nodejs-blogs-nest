import { emailAdapter } from './email.adapter';
import { UserType } from '../types/users.types';

export const emailTemplatesManager = {
  async sendEmailConfirmationMessage(user: UserType) {
    await emailAdapter.sendEmail(
      user.email,
      'Confirm email',
      `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='http://localhost:2000/start-forms/registration-confirmation?code=${user.confirmationCode}&email=${user.email}'>
     complete registration
     </a>
 </p>`,
    );
  },

  async sendPasswordRecoveryMessage(user: UserType, recoveryCode: string) {
    await emailAdapter.sendEmail(
      user.email,
      'Password recovery',
      ` <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='http://localhost:2000/start-forms/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`,
    );
  },

  async resendEmailConfirmationMessage(email: string, code: string) {
    await emailAdapter.sendEmail(
      email,
      'Confirm email',
      `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='http://localhost:2000/start-forms/registration-confirmation?code=${code}&email=${email}'>
     complete registration
     </a>
 </p>`,
    );
  },
};
