'use strict';
const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

class LoginController {
  //GET response to login page
  //Put's locals variables in the start configuration
  index(req, res, next) {
    res.locals.page = 'login';
    res.locals.error = '';
    res.locals.email = '';
    res.render('login');
  }

  //POST response to login page
  async post(req, res, next) {
    const { email, password } = req.body;

    //DB search
    try {
      const usuario = await Usuario.findOne({ email });

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        res.locals.error = res.__('Invalid credentials');
        res.locals.email = email;
        res.locals.page = 'login';
        res.render('login');
        return;
      }
      //Si existe y coincide
      //apunto en la sesión que es un usuario logado
      req.session.userLogged = usuario.id;

      //--> llevar a zona privada
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  //GET response to a logout request
  logout(req, res, next) {
    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/');
    });
  }

  //Response to a login request from API
  async postJWT(req, res, next) {
    const { email, password } = req.body;

    //Buscar en BDD
    try {
      const usuario = await Usuario.findOne({ email });

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        res.status(401);
        res.json({ error: 'Invalid credentials' });
        return;
      }
      //Si existe y coincide
      //Generar un token JWT con su _id
      const token = jwt.sign({ _id: usuario.id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });

      //--> responde con token
      res.json({ token });
    } catch (err) {
      res.status(500);
      let message;
      err.message === 'secretOrPrivateKey must have a value'
        ? (message = 'Server Error. This server has not private key')
        : (message = 'Undefined Server error');
      res.json({ error: message });
    }
  }
}

module.exports = LoginController;
