'use strict';

const jwt = require('jsonwebtoken');

// módulo que exporta un token
module.exports = (req, res, next) => {
  //recoger de la cabecera, de la query-string o del body
  const jwtToken =
    req.get('Authorization') || req.query.token || req.body.token;

  // comprobar que me han pasado el token
  if (!jwtToken) {
    const error = new Error('no token provided');
    error.status = 401;
    next(error);
    return;
  }

  // comprobar que el token es válido.
  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      const error = new Error('ivalid token');
      error.status = 401;
      next(error);
      return;
    }
    req.apiUserId = payload._id;
    next();
  });

  // si es válido, continuar
};
