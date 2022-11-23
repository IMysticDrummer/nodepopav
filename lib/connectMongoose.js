'use strict';
/* global process */

const mongoose=require('mongoose');

mongoose.connection.on('error', err => {
  console.log('Error de conexión a mongoDB:', err);
  
  process.exit(1);
});

mongoose.connection.once('open', () => {
  console.log(`Conectado a MongoDB en ${mongoose.connection.name}. Versión mongoose: ${mongoose.version}`);
});

const connectDB= async () => {
  try{
    await mongoose.connect('mongodb://localhost/nodepop');
  } catch(error) {
    console.log('Error de conexión: ', error.reason);
    process.exit(1);
  }
};

connectDB();

module.exports=mongoose.connection;