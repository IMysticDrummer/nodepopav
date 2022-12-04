'use strict';

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ruta = path.join(__dirname, '..', 'public', 'images', 'anuncios');
    cb(null, ruta);
  },
  filename: function (req, file, cb) {
    cb(null, 'product-' + Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const typeFile = file.mimetype.split('/', 1);
  const type = typeFile[0];
  if (type !== 'image') {
    return cb(new Error('This is not an image file'));
  }
  cb(null, true);
};

const limits = { fileSize: 10 * Math.pow(1024, 2) };

module.exports = {
  upload: multer({ storage, fileFilter: fileFilter, limits }),
  multerError: multer.MulterError,
};
