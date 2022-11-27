'use strict';
const { Usuario } = require('../models');

class LoginController {
  index(req, res, next) {
    /*    let data = {};
    data.title = req.title;
    data.page = 'login';
    data.error = '';
    res.render('login', data);
*/
    res.locals.title = req.title;
    res.locals.page = 'login';
    res.locals.error = '';
    res.render('login');
  }

  async post(req, res, next) {
    const { email, password } = req.body;

    console.log(email, password);

    //Buscar en BDD
    try {
      const usuario = await Usuario.findOne({ email });

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario) {
        res.locals.error = res.__('Invalid credentials');
        res.locals.title = req.title;
        res.locals.page = 'login';
        res.render('login');
        return;
      }
      console.log(usuario.id);
    } catch (error) {
      next(error);
    }

    //Si existe y coincide --> llevar a zona privada
  }
}

module.exports = LoginController;
