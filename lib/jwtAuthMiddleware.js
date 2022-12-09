'use strict';

const jwt = require('jsonwebtoken');

// módulo que exporta un token
module.exports = (req, res, next) => {
  //recoger de la cabecera o de la query-string
  const jwtToken = req.get('Authorization') || req.query.token;

  // comprobar que me han pasado el token
  if (!jwtToken) {
    const err = new Error('no token provided');
    err.status = 401;
    err.message = 'no token provided';
    res.status(err.status);
    res.json({
      status: err.status,
      error: err.message,
    });
    return;
  }

  // comprobar que el token es válido.
  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      const error = new Error('invalid token');
      error.status = 401;
      res.status(error.status);
      res.json({
        status: error.status,
        error: error.message,
      });
      return;
    }

    // si es válido, continuar
    req.apiUserId = payload._id;
    next();
  });
};
