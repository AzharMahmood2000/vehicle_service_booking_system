const Setting = require("../models/setting");

const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const publicKeys = [
      "booking_rules",
      "about_content",
      "contact_info",
    ];

    if (!publicKeys.includes(key)) {
      return res.status(403).json({
        success: false,
        message: "This setting is not publicly accessible",
      });
    }

    const setting = await Setting.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    return res.status(200).json({
      success: true,
      setting: {
        key: setting.key,
        value: setting.value,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
      error: error.message,
    });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Setting value is required",
      });
    }

    const allowedKeys = [
      "booking_rules",
      "about_content",
      "contact_info",
    ];

    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting key",
      });
    }

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update setting",
      error: error.message,
    });
  }
};

module.exports = {
  getSetting,
  updateSetting,
};