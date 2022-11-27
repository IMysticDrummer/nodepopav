'use strict';
const { Usuario } = require('../models');

class LoginController {
  index(req, res, next) {
    res.locals.title = req.title;
    res.locals.page = 'login';
    res.locals.error = '';
    res.locals.email = '';
    res.render('login');
  }

  async post(req, res, next) {
    const { email, password } = req.body;

    console.log(email, password);

    //Buscar en BDD
    try {
      const usuario = await Usuario.findOne({ email });
      console.log('Usuario: ', usuario);
      console.log('Postpassword: ', password);
      console.log('hashPostPassword: ', await Usuario.hashPassword(password));
      console.log('usuario pass: ', usuario.password);

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        res.locals.error = res.__('Invalid credentials');
        res.locals.email = email;
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
    res.redirect('/');
  }
}

module.exports = LoginController;
