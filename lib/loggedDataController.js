'use strict';
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  const userId = req.session.userLogged;
  try {
    const user = await Usuario.findById(userId);

    if (!user) {
      //Si hay algún fallo con el usuario, regenera la sesión y redirige a la raíz (y por tanto acabará en el /login)
      req.session.regenerate((err) => {
        if (err) {
          next(`No se ha encontrado el usuario, y hemos tenido problemas al regenerar los datos en tu navegador.\n
          Asegúrate de borrar la cookies y vuelve a intentarlo.\n. Error: ${err}`);
          return;
        }
        setInterval(res.redirect('/'), 2000);
      });
      return;
    }

    req.userEmail = user.email;
    next();
  } catch (err) {
    next(err);
  }
};
