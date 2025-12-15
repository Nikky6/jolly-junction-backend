const nodemailer = require("nodemailer");

const sendOtpToEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP - Jolly Junction",
      html: `<h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);
  } catch (error) {
    console.log("Error sending OTP:", error.message);
    throw new Error("Email sending failed");
  }
};

module.exports = sendOtpToEmail;
