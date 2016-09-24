import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { devices } from 'lib/config';
import { Clock } from 'lib/models';

const server = require('lib/index');
const db = require('lib/database').db;
const expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiHttp);

const clearDB = () => {
  Object.keys(devices).forEach( device => {
    db[`states_${device}`].remove({});
  });
};

const test_device = Object.keys(devices)[0];
const authorization = `Bearer ${test_device}`;

describe('POST /states', () => {

  before(clearDB);
  after(clearDB);

  it('must validate token', done => {
    chai.request(server.listener)
      .post('/states')
      .set('Authorization', 'Bearer not-a-valid-device')
      .end((err, res) => {
        expect(res.status).to.be.equal(401);
        done();
      });
  });

  it('must return a 400 with a valid token and empty payload', done => {
    chai.request(server.listener)
      .post('/states')
      .set('Authorization', authorization)
      .end((err, res) => {
        expect(res.status).to.be.equal(400);
        done();
      });
  });

  it('must return a 204 with a valid payload an create an state for the device', done => {
    chai.request(server.listener)
      .post('/states')
      .set('Authorization', authorization)
      .set('x-local-ip', '192.168.1.200')
      .send({ temperature: 23.2, humidity: 53.1, heatIndex: 23.8 })
      .end((err, res) => {
        expect(res.status).to.be.equal(204);
        expect(res.body).to.be.empty;

        db[`states_${test_device}`].find({}, (err, [state]) => {
          expect(state).to.be.ok;

          expect(state.humidity).to.be.equal(53.1);
          expect(state.temperature).to.be.equal(23.2);
          expect(state.heatIndex).to.be.equal(23.8);
          expect(state.localIP).to.be.equal('192.168.1.200');
          expect(state.publicIP).to.be.equal('127.0.0.1');

          expect(state._id).to.be.a('number');

          const storeBy = devices[test_device].storeBy;
          const [key] = Object.keys(storeBy);

          const nowFloor = Clock.floorTime(new Date(), storeBy[key], key).getTime();
          expect(state._id).to.be.equal(nowFloor);

          done();
        });

      });
  });

  it('must replace last stored state if it is called within 5 minutes', done => {
    chai.request(server.listener)
      .post('/states')
      .set('Authorization', authorization)
      .set('x-local-ip', '192.168.1.200')
      .send({ temperature: 30.5, humidity: 80.2, heatIndex: 33.7 })
      .end((err, res) => {
        expect(res.status).to.be.equal(204);
        expect(res.body).to.be.empty;

        db[`states_${test_device}`].find({}, (err, states) => {
          expect(states.length).to.be.equal(1);

          const [state] = states;
          expect(state.humidity).to.be.equal(80.2);
          expect(state.temperature).to.be.equal(30.5);
          expect(state.heatIndex).to.be.equal(33.7);

          done();
        });

      });
  });

  it('must create a new state past the 5 minutes', done => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const clock = sinon.useFakeTimers(now.getTime());

    chai.request(server.listener)
      .post('/states')
      .set('Authorization', authorization)
      .set('x-local-ip', '192.168.1.200')
      .send({ temperature: 10, humidity: 12, heatIndex: 13 })
      .end((err, res) => {
        expect(res.status).to.be.equal(204);
        expect(res.body).to.be.empty;

        clock.restore();

        db[`states_${test_device}`].find({}, (err, states) => {
          expect(states.length).to.be.equal(2);

          const state = states[1];
          expect(state.humidity).to.be.equal(12);
          expect(state.temperature).to.be.equal(10);
          expect(state.heatIndex).to.be.equal(13);

          done();
        });

      });
  });

});
