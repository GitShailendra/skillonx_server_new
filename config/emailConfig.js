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
const sendVerificationEmail = async (email, verificationCode,acoountType) => {
  try {
    const baseUrl = 'http://localhost:5173';
    const prodUrl = 'https://skillonx.com'
    // For production
    // const baseUrl = 'https://skillonx.com';
    
    const verificationLink = `${prodUrl}/verification-email?code=${verificationCode}&email=${encodeURIComponent(email)}&accountType=${acoountType}`;



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

const sendApprovalEmail = async (universityEmail, isApproved, universityName, remarks) => {
  try {
    // Email template for approval
    const approvalTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #0d6efd;">Skillonx University Update</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${universityName},</p>
          
          ${isApproved ? `
            <p>Congratulations! Your university registration has been approved. You can now access your account on Skillonx.</p>
            
            <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>Status: Approved</strong>
            </div>

            <p>Next steps:</p>
            <ol>
              <li>Log in to your university account</li>
              <li>Complete your university profile</li>
              <li>Start managing your courses and students</li>
            </ol>
          ` : `
            <p>Thank you for your interest in registering with Skillonx. After careful review of your application, we regret to inform you that we cannot approve your registration at this time.</p>
            
            <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>Status: Not Approved</strong>
              ${remarks ? `<p style="margin-top: 10px;">Remarks: ${remarks}</p>` : ''}
            </div>

            <p>If you believe this decision was made in error or would like to submit additional information, please contact our support team.</p>
          `}
          
          <p style="margin-top: 20px;">Best regards,<br>The Skillonx Team</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>If you need assistance, please contact our support team.</p>
        </div>
      </div>
    `;

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: universityEmail,
      subject: isApproved ? 'University Registration Approved - Skillonx' : 'University Registration Update - Skillonx',
      html: approvalTemplate
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
};
const sendBulkWelcomeEmail = async (users, subject, messageContent) => {
  try {
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid users data provided');
    }

    const emailTemplate = (firstName, content) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #0d6efd;">skillonx Message</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${firstName},</p>
          
          ${content}
          
          <p>Best regards,<br>The skillonx Team</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>If you need help, please contact our support team.</p>
        </div>
      </div>
    `;

    // Send emails to all users
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const mailOptions = {
            from: `Skillonx <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: subject || 'Message from Skillonx',
            html: emailTemplate(user.firstName || 'Student', messageContent)
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${user.email}:`, info.messageId);
          return { 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName, 
            success: true 
          };
        } catch (error) {
          console.error(`Error sending email to ${user.email}:`, error);
          return { 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            success: false, 
            error: error.message 
          };
        }
      })
    );

    // Return summary of results
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    };

    return summary;
  } catch (error) {
    console.error('Error in bulk email:', error);
    throw error;
  }
};
module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendApprovalEmail,
  sendBulkWelcomeEmail
};