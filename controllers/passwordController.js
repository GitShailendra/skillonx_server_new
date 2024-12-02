// controllers/passwordController.js

const Student = require('../models/Student');
const University = require('../models/University');
const {sendEmail} = require('../config/emailConfig');
const bcrypt = require('bcrypt');

// Utility function to generate reset token email HTML
const generateResetEmailHTML = (name, resetToken) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0a192f;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Here is your reset code:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h1 style="color: #0a192f; margin: 0; font-size: 32px;">${resetToken}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>SkillOnX Team</p>
    </div>
  `;
};

// Generic function to handle password reset for both user types
const handlePasswordReset = async (Model, email) => {
  const user = await Model.findOne({ email });
  
  if (!user) {
    throw new Error('No account found with this email');
  }

  // Generate 6-digit reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Save reset token to user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  return { user, resetToken };
};

// Student Password Reset Controllers
exports.studentForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { user, resetToken } = await handlePasswordReset(Student, email);
    console.log(user)
    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Request - SkillOnX',
      html: generateResetEmailHTML(user.firstName, resetToken)
    });

    if (!emailSent) {
      throw new Error('Failed to send reset email');
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to email'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.studentResetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const student = await Student.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    student.password = hashedPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Password Reset Successful - SkillOnX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a192f;">Password Reset Successful</h2>
          <p>Hello ${student.firstName},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you did not perform this action, please contact support immediately.</p>
          <p>Best regards,<br>SkillOnX Team</p>
        </div>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
// Backend Controller - Add this to your existing controller file

exports.studentResendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the student
    const student = await Student.findOne({ email });
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found with this email'
      });
    }

    // Generate new reset token
    const { resetToken } = await handlePasswordReset(Student, email);

    // Send new email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Code Resent - SkillOnX',
      html: generateResetEmailHTML(student.firstName, resetToken)
    });

    if (!emailSent) {
      throw new Error('Failed to send reset email');
    }

    res.status(200).json({
      status: 'success',
      message: 'New reset code sent to your email'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
// University Password Reset Controllers
exports.universityForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { user, resetToken } = await handlePasswordReset(University, email);

    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Request - skillonx',
      html: generateResetEmailHTML(user.universityName, resetToken)
    });

    if (!emailSent) {
      throw new Error('Failed to send reset email');
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to email'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.universityResetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const university = await University.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!university) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    university.password = hashedPassword;
    university.resetPasswordToken = undefined;
    university.resetPasswordExpires = undefined;
    await university.save();

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Password Reset Successful - SkillOnX',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a192f;">Password Reset Successful</h2>
          <p>Hello ${university.universityName},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you did not perform this action, please contact support immediately.</p>
          <p>Best regards,<br>SkillOnX Team</p>
        </div>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.universityResendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the student
    const university = await University.findOne({ email });
    
    if (!university) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found with this email'
      });
    }

    // Generate new reset token
    const { resetToken } = await handlePasswordReset(University, email);

    // Send new email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Code Resent - SkillOnX',
      html: generateResetEmailHTML(university.universityName, resetToken)
    });

    if (!emailSent) {
      throw new Error('Failed to send reset email');
    }

    res.status(200).json({
      status: 'success',
      message: 'New reset code sent to your email'
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};