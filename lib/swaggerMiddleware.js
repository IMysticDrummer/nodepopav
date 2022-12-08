'use strict';

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Nodepop',
      version: '1.0',
      description: 'API de anuncios',
    },
  },
  apis: ['swagger.yaml'],
};

const specification = swaggerJSDoc(options);

module.exports = [swaggerUI.serve, swaggerUI.setup(specification)];
