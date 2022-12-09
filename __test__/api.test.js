'use strict';

const request = require('supertest');
require('../bin/allService');
const app = require('../app');

let tokenAdquired;

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
          tokenAdquired = res.body.token;
          return done();
        });
    });
  });

  describe('/api/anuncios', () => {
    describe('GET Method', () => {
      describe('Authorization by token', () => {
        it('should return 401 status and error object if not token is provided in GET', (done) => {
          request(app)
            .get('/api/anuncios')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 401,
                  error: 'no token provided',
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
        it('should return 401 status and error object if token is not valid in GET. Token given by header Authorization', (done) => {
          request(app)
            .get('/api/anuncios')
            .set('Authorization', 'hijk')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 401,
                  error: 'invalid token',
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
        it('should return 401 status and error object if token is not valid in GET. Token given by query', (done) => {
          const token = '?token=1234';
          request(app)
            .get('/api/anuncios' + token)
            .expect('Content-Type', /json/)
            .expect(401)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 401,
                  error: 'invalid token',
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
        it('should return 200 status and object results if token is valid in GET. Token given by header Authorization', (done) => {
          request(app)
            .get('/api/anuncios')
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  results: expect.any(Array),
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
        it('should return 200 status and object results if token is valid in GET. Token given by query', (done) => {
          const token = '?token=' + tokenAdquired;
          request(app)
            .get('/api/anuncios' + token)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  results: expect.any(Array),
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
      });
      describe('?filters...', () => {
        it('should return 422 status and error object if "venta" is not boolean', (done) => {
          const filter = '?venta=anystring';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
        it('should return 422 status and error object if "tag" is a value not permitted', (done) => {
          const filter = '?tag=anystring';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
        it('should return 422 status and error object if "precio" is not equal to regex permitted', (done) => {
          const filter = '?precio=anystring';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
        it('should return 422 status and error object if "skip" is not an integer value', (done) => {
          const filter = '?skip=1.5';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
        it('should return 422 status and error object if "limit" is not an integer value', (done) => {
          const filter = '?limit=1.5';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
        it('should return 422 status and error object if "sort" is not a permitted value', (done) => {
          const filter = '?sort=apellido';
          request(app)
            .get('/api/anuncios' + filter)
            .set('Authorization', tokenAdquired)
            .expect('Content-Type', /json/)
            .expect(422)
            .expect((res) => {
              expect(res.body).toEqual(
                expect.objectContaining({
                  status: 422,
                  error: expect.any(Array),
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
      });
    });
    //TODO
    describe('POST Method', () => {
      const objectData = {
        nombre: 'prueba',
        venta: false,
        precio: 50,
        foto: null,
        tags: ['lifestyle', 'work'],
      };
      it('should return 400 status and error object if image has not been set', (done) => {
        request(app)
          .post('/api/anuncios')
          .set('Authorization', tokenAdquired)
          .send(objectData)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect((res) => {
            expect(res.body).toEqual(
              expect.objectContaining({
                status: 400,
                error: expect.any(String),
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
    });

    describe('/api/anuncios/alltags GET Method', () => {
      it('should return 200 status and object with tags permitted and number of advertisement of each cathegory', (done) => {
        request(app)
          .get('/api/anuncios/alltags')
          .set('Authorization', tokenAdquired)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(
              expect.objectContaining({
                results: expect.objectContaining({
                  lifestyle: expect.any(Number),
                  work: expect.any(Number),
                  mobile: expect.any(Number),
                  motor: expect.any(Number),
                }),
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
    });
  });
});
