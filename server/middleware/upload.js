const multer = require('multer');

// Memory storage is ideal as we convert to Base64 or upload to Cloudinary directly
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max size
  },
  fileFilter: fileFilter,
});

module.exports = upload;
