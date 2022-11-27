'use strict';
const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');

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

    //Buscar en BDD
    try {
      const usuario = await Usuario.findOne({ email });

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        res.locals.error = res.__('Invalid credentials');
        res.locals.email = email;
        res.locals.title = req.title;
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

  logout(req, res, next) {
    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/');
    });
  }

  async postJWT(req, res, next) {
    const { email, password } = req.body;

    //Buscar en BDD
    try {
      const usuario = await Usuario.findOne({ email });

      // Si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        //TODO res.status=401;
        res.json({ error: 'Invalid credentials' });
        return;
      }
      //Si existe y coincide

      //Generar un token JWT con su _id
      const token = jwt.sign({ _id: usuario.id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });

      //--> llevar a zona privada
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LoginController;
