const ContactRequest = require("../models/contactrequest");

const createContactRequest = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      message,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email and message are required",
      });
    }

    const contactRequest = await ContactRequest.create({
      name,
      phone,
      email,
      message,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Contact request submitted successfully",
      contactRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact request",
      error: error.message,
    });
  }
};

const getContactRequests = async (req, res) => {
  try {
    const contactRequests = await ContactRequest.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: contactRequests.length,
      contactRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact requests",
      error: error.message,
    });
  }
};

const updateContactRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "CONTACTED",
      "RESOLVED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request status",
      });
    }

    const contactRequest = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact request status updated successfully",
      contactRequest,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact request ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update contact request status",
      error: error.message,
    });
  }
};

module.exports = {
  createContactRequest,
  getContactRequests,
  updateContactRequestStatus,
};