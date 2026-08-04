const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Admin = require("../models/admin");
const sendEmail = require("../utils/sendemail");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        profileImage: admin.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        profileImage: req.admin.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin details",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be equal to the current password",
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.passwordHash = hashedPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Save relative path
    const filePath = `/uploads/profiles/${req.file.filename}`;
    admin.profileImage = filePath;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: filePath
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile image',
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const genericMessage =
      "If an administrator account exists for this email, a password reset link has been sent.";

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      // Do NOT reveal that the account doesn't exist
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // Generate cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await admin.save();

    // Build reset URL
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/admin-reset-password?token=${rawToken}&email=${encodeURIComponent(admin.email)}`;

    // Send reset email
    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #140821; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #200130, #3A1F45); padding: 40px 36px 32px 36px; text-align: center;">
          <div style="display: inline-block; background-color: #FF1493; color: #FFFFFF; width: 40px; height: 40px; line-height: 40px; text-align: center; border-radius: 10px; font-weight: bold; font-size: 20px;">V</div>
          <span style="color: #FFFFFF; font-size: 22px; font-weight: bold; vertical-align: middle; margin-left: 12px;">VehicleCare</span>
        </div>
        <div style="padding: 36px;">
          <h2 style="color: #FFFFFF; font-size: 22px; margin: 0 0 16px 0;">Password Reset Request</h2>
          <p style="color: #B0A6B9; font-size: 14px; line-height: 1.7; margin: 0 0 28px 0;">
            A password reset was requested for your VehicleCare administrator account. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #FF1493; color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #726B7A; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
            This link expires in 30 minutes. If you did not request this reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
          <p style="color: #4A4453; font-size: 11px; margin: 0; text-align: center;">
            &copy; VehicleCare. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: admin.email,
        subject: "VehicleCare Admin Password Reset",
        html: htmlContent,
      });
    } catch (emailError) {
      // Safe diagnostic logging — never logs credentials or tokens
      console.error("Password reset email error:", {
        name: emailError.name,
        code: emailError.code,
        command: emailError.command,
        message: emailError.message,
      });

      // Clear token if email fails
      admin.resetPasswordToken = null;
      admin.resetPasswordExpires = null;
      await admin.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token, and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Hash the submitted raw token to compare against stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash new password using the same bcrypt architecture
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.passwordHash = hashedPassword;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
    });
  }
};

module.exports = {
  loginAdmin,
  getMe,
  changePassword,
  updateProfileImage,
  forgotPassword,
  resetPassword,
};
