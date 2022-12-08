'use strict';

const request = require('supertest');
require('../bin/allService');
const app = require('../app');

describe('Testing API endpoints', () => {
  describe('/api/login', () => {
    it('should return error object with status 401', async () => {
      const response = await request(app).get('/api/login');
    });
  });
});
