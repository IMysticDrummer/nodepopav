'use strict';
// Comment to evite eslint no-undef error
/* global process */
require('dotenv').config();
const readline = require('readline');
const i18n = require('i18n');

// Var to connect DB
const connection = require('./lib/connectMongoose');

// Load models
const { Advertisement, Usuario } = require('./models');

async function main() {
  //Assure the await to the DB connection before ask
  await connection.$initialConnection;
  const continuar = await pregunta(
    'Are you sure, sure, sure that you want to delete all the database, charging initial data? (yes/no) '
  );
  if (!continuar) {
    console.log('\n Canceled \n');
    process.exit();
  }

  // intialize ads collection
  await initAds();
  await initUsers();

  //closing connection DB
  connection.close();
}

main().catch((err) => console.log('There was an error:', err));

/**
 * Initialize ads collection
 */
async function initAds() {
  // Delete all documents
  const deleted = await Advertisement.deleteMany();
  console.log(`Deleted ${deleted.deletedCount} advertisements.`);

  //Synchronize the indexes
  const syncIndex = await Advertisement.syncIndexes();
  console.log(`Reviewed ${syncIndex} index`);

  // Load intial ads
  const adsFile = require('./anunciosBase.json');
  const inserted = await Advertisement.insertMany(adsFile.advertisements);
  console.log(`Created ${inserted.length} advertisements.`);
}

function loadUsersFromFile() {
  return new Promise((resolve, reject) => {
    const usersFile = require('./usuariosBase.json');
    let users = [];
    usersFile.usuarios.forEach(async (usuario) => {
      let password = usuario.password;
      if (typeof password !== 'string') {
        password = `${password}`;
      }
      try {
        const hashPassword = await Usuario.hashPassword(password);
        const newUser = {
          email: usuario.email,
          password: hashPassword,
        };
        users = users.concat([newUser]);
        console.log('new user: ', newUser);
      } catch (err) {
        console.log('ERROR: ', err);
        reject(err);
      }
    });
    console.log('usuarios: ', users);
    resolve(users);
  });
}

/**
 * Initialize Users collection
 */
async function initUsers() {
  // Delete all documents
  const deleted = await Usuario.deleteMany();
  console.log(`Deleted ${deleted.deletedCount} users.`);

  //Synchronize the indexes
  const syncIndex = await Usuario.syncIndexes();
  console.log(`Review ${syncIndex} user index`);

  // Load intial ads
  //TODO
  try {
    //const users = await loadUsersFromFile();
    const users = [
      {
        email: 'user@example.com',
        password: await Usuario.hashPassword('1234'),
      },
    ];
    console.log(users);
    const inserted = await Usuario.insertMany(users);
    console.log(`Created ${inserted.length} users.`);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Function to ask a question
 * @param {string} texto String to present in console
 * @returns Promise returns true if the answer is "si", false in other case.
 */
function pregunta(texto) {
  return new Promise((resolve) => {
    const ifc = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    ifc.question(texto, (respuesta) => {
      ifc.close();
      if (respuesta.toLowerCase() === 'yes') {
        resolve(true);
        return;
      }
      resolve(false);
    });
  });
}
