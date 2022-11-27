'use strict';

class LoginController {
  index(req, res, next) {
    let data={};
    data.title = req.title;
    data.page='login';
    res.render('login', data);
  }
}

module.exports = LoginController;
