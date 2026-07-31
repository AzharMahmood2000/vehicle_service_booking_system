const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");

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

module.exports = {
  loginAdmin,
  getMe,
  changePassword,
  updateProfileImage,
};
