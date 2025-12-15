const nodemailer = require("nodemailer");

const sendWelcomeMail = async (email, name) => {
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
      from: `"Jolly Junction 💖" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Welcome to Jolly Junction 💕",
      html: `
        <h2>Hey ${name} 💫</h2>
        <p>Your account is successfully verified!</p>
        <p>Now you're officially a part of <b>Jolly Junction Family 🔥</b></p>
        <br/>
        <p>Login now and start exploring nearby users 😘</p>
        <br/>
        <p>With love,<br/>Jolly Junction Team 💖</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent ❤️");
  } catch (error) {
    console.log("Error sending welcome email:", error.message);
  }
};

module.exports = sendWelcomeMail;
