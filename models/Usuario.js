'use strict';

const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');

//crear el esquema
const usuarioSchema = mongoose.Schema({
  //con unique aseguramos que se genere un índice, y además sea único
  email: { type: String, unique: true },
  password: String,
});

//método estático para hacer el hash de una password
//usuarioSchema.statics.hashPassword = function (passwordEnClaro) {
//  return bcrypt.hash(passwordEnClaro, 7);
//};

//método en instacia para comparar
//usuarioSchema.methods.comparePassword = function (passwordEnClaro) {
//  return bcrypt.compare(passwordEnClaro, this.password);
//};
// crear el modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

//exportar el modelo
module.exports = Usuario;
