'use strict';
const express = require('express');
const router = express.Router();

router.get('/:locale', (req, res, next) => {
  const locale = req.params.locale;

  res.cookie('nodepop-locale', locale, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  if (req.get('Referrer')) {
    res.redirect(req.get('Referrer'));
  } else {
    res.redirect('/');
  }
});

module.exports = router;
