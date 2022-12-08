'use strict';

const request = require('supertest');
require('../bin/allService');
const app = require('../app');

describe('Testing API endpoints', () => {
  describe('/api/login', () => {
    it('should return error object with status 404 when try GET', (done) => {
      request(app)
        .get('/api/login')
        .expect('Content-Type', /json/)
        .expect(404)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              status: 404,
              error: "API page doesn't found",
            })
          );
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          return done();
        });
    });

    it("should return error object with status 401 and message==='Invalid Credentials' when post without credentials", (done) => {
      request(app)
        .post('/api/login')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              status: 401,
              error: 'Invalid credentials',
            })
          );
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          return done();
        });
    });

    it('should return a token object and status 200 when good credetials are provided', (done) => {
      request(app)
        .post('/api/login')
        .send({ email: 'user@example.com', password: '1234' })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ token: expect.any(String) })
          );
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          return done();
        });
    });
  });
});
