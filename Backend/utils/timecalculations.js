const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const calculateEndTime = (startTime, durationMins) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMins;

  return minutesToTime(endMinutes);
};

const hasTimeConflict = (
  newStartTime,
  newEndTime,
  existingStartTime,
  existingEndTime
) => {
  const newStart = timeToMinutes(newStartTime);
  const newEnd = timeToMinutes(newEndTime);
  const existingStart = timeToMinutes(existingStartTime);
  const existingEnd = timeToMinutes(existingEndTime);

  return newStart < existingEnd && newEnd > existingStart;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  hasTimeConflict,
};