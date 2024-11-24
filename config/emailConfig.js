// config/emailConfig.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `skillonx <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const verificationLink = `http://localhost:5173/verify?email=${encodeURIComponent(
      email
    )}&code=${verificationCode}`;

    const mailOptions = {
      from: `skillonx <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <p>Thank you for registering at skillonx.</p>
        <p>Your verification code is:</p>
        <h2>${verificationCode}</h2>
        <p>Alternatively, you can verify your email by clicking the link below:</p>
        <a href="${verificationLink}" style="color: #007bff; text-decoration: none;">Verify My Email</a>
        <p>If you did not register, please ignore this email.</p>
      `,
      text: `Thank you for registering at skillonx.\n\nYour verification code is: ${verificationCode}\n\nAlternatively, you can verify your email by visiting this link: ${verificationLink}\n\nIf you did not register, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};



module.exports = {
  sendEmail,
  sendVerificationEmail,
};