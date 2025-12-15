import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
export const sendEmail = async (data: Mail.Options) => {
  const transporter: Transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL as string,
      pass: process.env.PASSWORD as string,
    },
  });

  const info = await transporter.sendMail({
    ...data,
    from: `Social Media <${process.env.EMAIL as string}>`,
  });

  console.log("Message sent : %s", info.messageId);
};

export const emailSubject: { confirmEmail: string; resetPassword: string } = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
};
