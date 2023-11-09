import nodemailer from 'nodemailer';

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'stupchyktestpurposes@gmail.com',
        pass: 'yuwytemembipsgfd',
      },
    });

    return await transporter.sendMail({
      from: 'Ivan <vanyastupchuk@gmail.com>',
      to: email,
      subject,
      html: message,
    });
  },
};
