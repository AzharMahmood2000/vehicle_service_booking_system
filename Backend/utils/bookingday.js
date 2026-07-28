const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return DAY_NAMES[date.getUTCDay()];
};

const isClosedDay = (dateString, closedDays = []) => {
  const dayName = getDayName(dateString);

  if (!dayName) {
    return false;
  }

  const normalizedClosedDays = closedDays.map((day) =>
    String(day).trim().toUpperCase()
  );

  return normalizedClosedDays.includes(dayName);
};

module.exports = {
  getDayName,
  isClosedDay,
};