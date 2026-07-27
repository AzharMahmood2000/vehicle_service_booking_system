const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);

  const randomPart = Math.floor(100 + Math.random() * 900);

  return `VC-${timestamp}-${randomPart}`;
};

module.exports = {
  generateBookingReference,
};