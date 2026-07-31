const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads/profiles'),
  path.join(__dirname, '../uploads/services')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const getStorage = (folderInfo) => {
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(__dirname, `../uploads/${folderInfo}`));
    },
    filename(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPG, PNG, and WebP are allowed.'), false);
  }
};

const uploadProfileImage = multer({
  storage: getStorage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

const uploadServiceImage = multer({
  storage: getStorage('services'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

module.exports = {
  uploadProfileImage,
  uploadServiceImage
};
