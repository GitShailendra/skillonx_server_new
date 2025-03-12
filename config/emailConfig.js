// config/emailConfig.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
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
const sendHackathonRegistrationEmail = async (email, fullName, domain, hasProposal) => {
  try {
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff;">Innovvvit Registration</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Dear ${fullName},</p>
          
          <p>Thank you for registering for <strong>Innovvvit 2025</strong>! We're excited to have you join our community of innovators and problem solvers.</p>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #6b46c1;">Registration Details</h3>
            <p><strong>Domain:</strong> ${domain}</p>
            <p><strong>Proposal Status:</strong> ${hasProposal ? 'Submitted' : 'Pending'}</p>
          </div>
          
          ${!hasProposal ? `
            <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>Important:</strong> Your registration is incomplete. Please submit your project proposal through your dashboard as soon as possible to complete your application.
            </div>
          ` : `
            <p>Our team will review your application and proposal. You'll be notified once the review process is complete.</p>
          `}
          
          <p>You can log in to your dashboard at any time to check your application status.</p>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p style="margin-top: 20px;">Best regards,<br>The Innovvvit 2025 Team</p>
        </div>

        <div style="background-color: #6b46c1; padding: 15px; text-align: center; font-size: 12px; color: #ffffff;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>© 2025 Innovvvit. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `Innovvvit 2025 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Innovvvit 2025 - Registration Confirmation',
      html: emailTemplate
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent to:', email, info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending hackathon registration email:', error);
    return false;
  }
};
const sendHackathonStatusEmail = async (email, fullName, status, domain, remarks = '') => {
  try {
    // Email content based on status
    let statusTitle, statusMessage, statusColor, ctaMessage;

    switch (status) {
      case 'shortlisted':
        statusTitle = 'Congratulations! You have Been Shortlisted';
        statusMessage = 'We are pleased to inform you that your application for Innovvvit 2025 has been shortlisted. Your innovative approach and proposal have impressed our review panel.';
        statusColor = '#28a745';
        ctaMessage = 'Please keep an eye on your email for further instructions regarding the next steps. We look forward to seeing your project come to life!';
        break;
      
      case 'under_review':
        statusTitle = 'Your Application is Under Review';
        statusMessage = 'We are currently reviewing your application and proposal. Our panel is evaluating all submissions carefully, and we will get back to you soon with a decision.';
        statusColor = '#17a2b8';
        ctaMessage = 'Thank you for your patience during this process. You can check your application status anytime through your dashboard.';
        break;
        
      case 'rejected':
        statusTitle = 'Application Status Update';
        statusMessage = 'Thank you for your interest in Innovvvit 2025. After careful consideration, we regret to inform you that your application has not been selected to proceed to the next round.';
        statusColor = '#dc3545';
        ctaMessage = 'We received many strong applications this year, making the selection process very competitive. We encourage you to apply for future hackathons and events.';
        break;
        
      default:
        statusTitle = 'Application Status Update';
        statusMessage = 'There has been an update to your Innovvvit 2025 application status. Please check your dashboard for the latest information.';
        statusColor = '#6c757d';
        ctaMessage = 'If you have any questions, feel free to contact our support team.';
    }

    // Create email template
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff;">Innovvvit 2025</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Dear ${fullName},</p>
          
          <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: white;">${statusTitle}</h2>
          </div>
          
          <p>${statusMessage}</p>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #6b46c1;">Application Details</h3>
            <p><strong>Domain:</strong> ${domain}</p>
            <p><strong>Status:</strong> ${status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            ${remarks ? `<p><strong>Reviewer Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          
          <p>${ctaMessage}</p>
          
          <p style="margin-top: 20px;">Best regards,<br>The Innovvvit 2025 Team</p>
        </div>

        <div style="background-color: #6b46c1; padding: 15px; text-align: center; font-size: 12px; color: #ffffff;">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>© 2025 Innovvvit. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `Innovvvit 2025 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Innovvvit 2025 - ${statusTitle}`,
      html: emailTemplate
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to: ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending hackathon status email:', error);
    return false;
  }
};
module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendApprovalEmail,
  sendBulkWelcomeEmail,
  sendHackathonRegistrationEmail,
  sendHackathonStatusEmail
};