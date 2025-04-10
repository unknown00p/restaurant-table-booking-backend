import Mailgen from "mailgen";

const mailGenrator = new Mailgen({
  theme: "default",
  product: {
    name: "healthy-or-not",
    link: "https://myapp.com",
  },
});

function sendEmail(email: string, otp: string) {
  // console.log(email,"in sendEmail")
  // console.log(otp,"in sendEmail")
  const emailTemp = {
    body: {
      name: email,
      intro: "Your One-Time-Password (OTP) for verification is below:",
      table: {
        data: [
          {
            OTP: otp,
          },
        ],
        columns: {
          customWidth: {
            OTP: "100%",
          },
          customAlignment: {
            OTP: "center",
          },
        },
        outro:
          "If you did not request this code, please ignore this email or contact support for help.",
      },
    },
  };

  const emailBody = mailGenrator.generate(emailTemp);
  const emailText = mailGenrator.generatePlaintext(emailTemp);

  return {
    emailBody,
    emailText
  };
}

export { sendEmail };
