import EnvConfig from '../helpers/EnvConfig';
import transporter from '../helpers/MailConfig';

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: EnvConfig.email_from,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
