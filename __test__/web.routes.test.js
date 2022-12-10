'use strict';

const request = require('supertest');
const app = require('../app');

describe('Testing Web Routes', () => {
  describe('Testing language change', () => {
    it('should return a redirect when change-lang is called', () => {
      request(app).get('/change-lang/en').expect(302);
    });
    it('should save cookies when a laguage change is required', (done) => {
      request
        .agent(app)
        .get('/change-lang/es')
        .expect('set-cookie', /nodepop-locale=es/)
        .end((err, res) => {
          if (err) return done(err);
        });
      request
        .agent(app)
        .get('/change-lang/en')
        .expect('set-cookie', /nodepop-locale=en/)
        .end((err, res) => {
          if (err) return done(err);
        });
      request
        .agent(app)
        .get('/change-lang/fr')
        .expect('set-cookie', /nodepop-locale=fr/)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
  });
  describe('Testing index page "/"', () => {
    it('should redirect to /login when session is not set', async () => {
      const call = await request(app).get('/logout');
      const callOutlogged = await request(app).get('/');
      expect(callOutlogged.status).toBe(302);
      expect(callOutlogged.header.location).toMatch(/login/);
    });
  });
  describe('Testing login page "/login"', () => {
    it('should returns 200 when somene is calling to /login', async () => {
      const login = await request(app).get('/login');
      expect(login.status).toBe(200);
    });
    it('should returns 401 when somene is loggining with bad credentials', async () => {
      const login = await request(app)
        .post('/login')
        .send({ email: 'user1@example.com', password: '1234' })
        .set('Accept', 'application/json')
        .expect(401);
    });
    it('should returns 302 and redirect "/" when somene is loggining', async () => {
      const login = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: '1234' })
        .set('Accept', 'application/json')
        .expect(302);
      expect(login.headers.location).toBe('/');
    });
  });
});
