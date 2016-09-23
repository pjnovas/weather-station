import chai from 'chai';
import chaiHttp from 'chai-http';

import { devices } from 'lib/config';
import { State } from 'lib/models';

const server = require('lib/index');
const expect = chai.expect;

chai.use(chaiHttp);

const clearDB = done => {
  State.remove({}, done);
};

const test_device = Object.keys(devices)[0];
const authorization = `Bearer ${test_device}`;

describe('POST /states', () => {

  before(clearDB);
  after(clearDB);

  it('must validate token', done => {
    chai.request(server.listener)
      .post('/api/states')
      .set('Authorization', 'Bearer not-a-valid-device')
      .end((err, res) => {
        expect(res.status).to.be.equal(401);
        done();
      });
  });

  it('must return a 400 with a valid token and empty payload', done => {
    chai.request(server.listener)
      .post('/api/states')
      .set('Authorization', authorization)
      .end((err, res) => {
        expect(res.status).to.be.equal(400);
        done();
      });
  });

  it('must return a 204 with a valid payload an create an state for the device', done => {
    chai.request(server.listener)
      .post('/api/states')
      .set('Authorization', authorization)
      .set('x-local-ip', '192.168.1.200')
      .send({ temperature: 23.2, humidity: 53.1, heatIndex: 23.8 })
      .end((err, res) => {
        expect(res.status).to.be.equal(204);
        expect(res.body).to.be.empty;

        State.findOne({ device: test_device }, (err, state) => {
          expect(state).to.be.ok;
          expect(state.device).to.be.equal(test_device);
          expect(state.humidity).to.be.equal(53.1);
          expect(state.temperature).to.be.equal(23.2);
          expect(state.heatIndex).to.be.equal(23.8);
          expect(state.localIP).to.be.equal('192.168.1.200');
          expect(state.publicIP).to.be.equal('127.0.0.1');

          expect(state.createdAt).to.be.ok;
          done();
        });

      });
  });

});
