import nodemailer from "nodemailer";
import { sendEmail } from "./mailTemplete";
import { NODEMAILER_EMAIL, NODEMAILER_PASS } from "../config/config";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASS,
  },
});

export async function emailSender(email: string, otp: string) {
  const { emailBody, emailText } = sendEmail(email, otp);
  const info = await transport.sendMail({
    from: `healthy-or-not --- ${process.env.NODEMAILER_EMAIL}`,
    to: email,
    subject: "Your OTP Code",
    text: emailText,
    html: emailBody,
  });
  console.log("Email sent: ", info.messageId);
}
