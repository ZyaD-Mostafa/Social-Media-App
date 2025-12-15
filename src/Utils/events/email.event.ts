import { EventEmitter } from "events";
import Mail from "nodemailer/lib/mailer";
import { emailSubject, sendEmail } from "../email/send.email";
import { template } from "../email/verfiy.email.template";

export const emailEvent = new EventEmitter();

interface IEmail extends Mail.Options {
  otp: number;
  username: string;
}

emailEvent.on("confirmEmil", async (data: IEmail) => {
  try {
    data.subject = emailSubject.confirmEmail,
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log("Fial to send email", error);
  }
});
