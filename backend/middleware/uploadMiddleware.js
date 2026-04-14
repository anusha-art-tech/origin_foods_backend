const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'chef-images');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const sanitizeFileName = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const baseName = path.basename(file.originalname || 'image', extension);
    cb(null, `${Date.now()}-${sanitizeFileName(baseName || 'image')}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image uploads are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const chefImageUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 6 },
]);

const buildFileUrl = (req, file) => `${req.protocol}://${req.get('host')}/uploads/chef-images/${file.filename}`;

module.exports = {
  chefImageUpload,
  buildFileUrl,
};
