var express = require('express');
const { validationResult } = require('express-validator');
var router = express.Router();
const {Advertisement}=require('../models/Anuncios');

let title= "Nodepop - The Web for purchase-sale second-hand articles";

//Routes GET home page
router.get('/', Advertisement.dataValidator('get'), async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (error) {
    error.status=422;
    next(error);
    return;
  }

  //Extracting the data for search
  let data=Advertisement.assingSearchData(req);
  //Adding title
  data.title=title;

  //Search and render
  try {
    data.ads= await Advertisement.search(data.filters, data.skip, data.limit, data.sort, data.fields);
    res.render('index', data);
  } catch(error) {
    error.message='Impossible consult the DataBase, or results failed. Assure connection and data';
    next(error);
  }
});

module.exports = router;
