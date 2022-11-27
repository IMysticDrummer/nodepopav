'use strict';
// Comment to evite eslint no-undef error
/* global process */

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

main().catch((err) => console.log('Hubo un error:', err));

/**
 * Initialize ads collection
 */
async function initAds() {
  // Delete all documents
  const deleted = await Advertisement.deleteMany();
  console.log(`Eliminados ${deleted.deletedCount} anuncios.`);

  //Synchronize the indexes
  const syncIndex = await Advertisement.syncIndexes();
  console.log(`Revisados ${syncIndex} índices`);

  // Load intial ads
  const adsFile = require('./anunciosBase.json');
  const inserted = await Advertisement.insertMany(adsFile.advertisements);
  console.log(`Creados ${inserted.length} anuncios.`);
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
  const usersFile = require('./usuariosBase.json');
  const inserted = await Usuario.insertMany(usersFile.usuarios);
  console.log(`Created ${inserted.length} users.`);
}

/**
 * Funtion to ask a question
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
