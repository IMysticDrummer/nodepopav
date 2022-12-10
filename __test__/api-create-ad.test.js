'use strict';

const request = require('supertest');
const { Advertisement } = require('../models');
const app = require('../app');
const path = require('path');

// jest.mock('../models', () => {
//   const originalModule = jest.requireActual('../models');
//   //console.log(originalModule.Advertisement.prototype.save);
//   originalModule.Advertisement.prototype.save = jest.fn((data) => {
//     return {
//       id: 'algun_id',
//       nombre: data.nombre,
//     };
//   });

//   return {
//     __esModule: true,
//     ...originalModule,
//   };
// });

// const responseSaveAd = (name) => {
//   return {
//     result: {
//       id: 'stringid',
//       msg: `Advertisement ${name} succesfully created`,
//     },
//   };
// };

let tokenAdquired;
describe.skip('/api/anuncios method POST', () => {
  describe('Testing ad well created', () => {
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
    it('should be status 201 and object {id: string, msg:/name-ad/', (done) => {
      request(app)
        .post('/api/anuncios')
        .set('Authorization', tokenAdquired)
        .field('nombre', 'prueba')
        .field('venta', false)
        .field('precio', 50)
        .field('tags', ['lifestyle', 'work'])
        .attach('foto', `${path.join(__dirname)}/bici.jpeg`)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            result: expect.any(Object),
          });
          expect(res.body.result).toMatchObject({
            id: expect.any(String),
            msg: 'Advertisement prueba succesfully created',
          });
        })
        .end((err, res) => {
          if (err) {
            console.log(res.body.error);
            return done(err);
          }
          return done();
        });
    });
    it('should be status 201 and object when tags is only a string with a permitted word', (done) => {
      request(app)
        .post('/api/anuncios')
        .set('Authorization', tokenAdquired)
        .field('nombre', 'prueba')
        .field('venta', false)
        .field('precio', 50)
        .field('tags', 'lifestyle')
        .attach('foto', './__test__/bici.jpeg')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            result: expect.any(Object),
          });
          expect(res.body.result).toMatchObject({
            id: expect.any(String),
            msg: 'Advertisement prueba succesfully created',
          });
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
