'use strict';

module.exports = (req, res, next) => {
  if (!req.session.userLogged) {
    console.log('aquí estoy');
    res.redirect('login');
    return;
  }
  next();
};
