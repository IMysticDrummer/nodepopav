'use strict';

class LoginController {
  index(req, res, next) {
    let data = {};
    data.title = req.title;
    data.page = 'login';
    res.render('login', data);
  }

  post(req, res, next) {
    const { email, password } = req.body;

    console.log(email, password);

    //Buscar en BDD

    // Si no lo encuentro o no coincide la contraseña --> error

    //Si existe y coincide --> llevar a zona privada
  }
}

module.exports = LoginController;
