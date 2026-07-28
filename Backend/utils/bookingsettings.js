const Setting = require("../models/setting");

const DEFAULT_BOOKING_RULES = {
  openingTime: "09:00",
  closingTime: "17:00",
  slotIntervalMins: 30,
  closedDays: [],
};

const getBookingRules = async () => {
  const setting = await Setting.findOne({
    key: "booking_rules",
  });

  if (!setting || !setting.value) {
    return DEFAULT_BOOKING_RULES;
  }

  return {
    ...DEFAULT_BOOKING_RULES,
    ...setting.value,
  };
};

module.exports = {
  getBookingRules,
};