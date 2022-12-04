'use strict';

const { upload, multerError } = require('./uploadConfig');

//Middleware to manage the upload errors
const fileUpload = (req, res, next) => {
  const uploading = upload.single('foto');
  uploading(req, res, (err) => {
    if (err instanceof multerError) {
      const status = 500;
      res.status(status);
      res.json({ status, error: err.message });
      return;
    } else if (err) {
      const status = 400;
      res.status(status);
      res.json({ status, error: err.message });
      return;
    }
    next();
  });
};

module.exports = fileUpload;
