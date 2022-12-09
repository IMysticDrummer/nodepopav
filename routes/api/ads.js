const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { Advertisement, tagsPermitted } = require('../../models');
const fileUpload = require('../../lib/fileUpload');
const path = require('path');
const { Requester } = require('cote');
const fs = require('fs');

//Route /api?...
router.get('/', Advertisement.dataValidator('get'), async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (error) {
    const status = 422;
    return res.status(status).json({ status, error: error.array() });
  }

  //Extracting the data for search
  let data = Advertisement.assingSearchData(req);

  try {
    const ads = await Advertisement.search(
      data.filters,
      data.skip,
      data.limit,
      data.sort,
      data.fields
    );
    res.json({ results: ads });
  } catch (error) {
    const status = 500;
    return res.status(status).json({ status, error: error.message });
  }
});

//Route api/tags --> Return tags permitted with the number of ads with this tag included
//next param is not going to be use. Deleted from the function call
router.get('/alltags', async (req, res) => {
  let filters = {};
  let results = {};

  for (let index = 0; index < tagsPermitted.length; index++) {
    const element = tagsPermitted[index];
    filters.tags = element;
    const tempResult = await Advertisement.search(filters);
    results[element] = tempResult.length;
  }

  res.json({ results: results });
});

//Router / method POST --> Save a new advertisement
//next param is not going to be use. Deleted from the function call
router.post(
  '/',
  fileUpload,
  Advertisement.dataValidator('post'),
  async (req, res) => {
    //Data validation
    try {
      validationResult(req).throw();
      if (!req.file) {
        throw new Error(
          'Image must be provided. Formats permitted: jpeg, png, bmp, tiff, giff'
        );
      }
    } catch (error) {
      if (
        error.message ===
        'Image must be provided. Formats permitted: jpeg, png, bmp, tiff, giff'
      ) {
        const status = 400;
        res.status(status);
        res.json({ status, error: error.message });
        return;
      }

      //If it's validation error, the object error has not array function.
      //First thing is erase the image file uploaded
      const fileName = req.file.destination + '/' + req.file.filename;
      fs.unlink(fileName, (err) => {
        console.log(err);
      });

      return res.status(422).json({ status: 422, error: error.array() });
    }

    //Tags format
    let tagsTemp;
    if (typeof req.body.tags === 'string') {
      tagsTemp = [req.body.tags];
    } else {
      tagsTemp = req.body.tags;
    }

    const splitPath = req.file.destination.split('public');
    const fileName = splitPath[1] + '/' + req.file.filename;

    //Model
    const ad = new Advertisement({
      nombre: req.body.nombre,
      venta: false || req.body.venta,
      precio: 0 || parseFloat(req.body.precio),
      foto: fileName,
      tags: tagsTemp,
    });

    //Saving document in DB
    try {
      const adCreated = await ad.save();
      res.status(201).json({
        result: {
          id: adCreated.__id,
          msg: `Advertisement ${adCreated.nombre} succesfully created`,
        },
      });
    } catch (error) {
      //If there's any problem creating the ad in DB, it's necessary delete the image file uploaded
      const fileName = req.file.destination + '/' + req.file.filename;
      fs.unlink(fileName, (err) => {
        if (err) {
          console.log(err);
        }
      });
      const status = 422;
      try {
        const fail = error.array();
        return res.status(status).json({ status, error: fail });
      } catch (err) {
        return res.status(422).json({ status, error: error });
      }
    }

    //Thumbnailer sólo cuando todo el proceso haya ido bien
    const requester = new Requester({ name: 'thumbnailer create requester' });
    const request = {
      type: 'thumbnailer',
      fileName,
      destination: '/images/thumbnails',
    };

    requester.send(request, (result) => {
      console.log(result);
    });
  }
);

module.exports = router;
