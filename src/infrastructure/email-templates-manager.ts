import { emailAdapter } from './email.adapter';
import { UserType } from '../types/users.types';

export const emailTemplatesManager = {
  async sendEmailConfirmationMessage(user: UserType) {
    await emailAdapter.sendEmail(
      user.email,
      'Confirm email',
      `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${user.confirmationCode}'>
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
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`,
    );
  },

  async resendEmailConfirmationMessage(email: string, code: string) {
    await emailAdapter.sendEmail(
      email,
      'Confirm email',
      `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${code}'>
     complete registration
     </a>
 </p>`,
    );
  },
};
