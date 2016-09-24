import chai from 'chai';
import chaiHttp from 'chai-http';
import _ from 'lodash';

import { devices } from 'lib/config';
import { Clock } from 'lib/models';

const server = require('lib/index');
const db = require('lib/database').db;
const expect = chai.expect;

chai.use(chaiHttp);

const clearDB = () => {
  Object.keys(devices).forEach( device => {
    db[`states_${device}`].remove({});
  });
};

const createStates = (device, howMany, fromDate, done) => {
  let states = [];

  const storeBy = devices[device].storeBy;
  const [key] = Object.keys(storeBy);

  _.times(howMany, () => {
    fromDate.setMinutes(fromDate.getMinutes() + 5);
    states.push({
      _id: Clock.floorTime(fromDate, storeBy[key], key).getTime(),
      temperature: _.random(0, 40),
      humidity: _.random(0, 100),
      heatIndex: _.random(0, 40)
    });
  });

  db[`states_${device}`].insert(states, done);
};

describe('GET /states', () => {

  describe('GET /last', () => {

    it('must return the last state by device', done => {
      clearDB();
      const [key0, key1] = Object.keys(devices);

      createStates(key0, 3, new Date(), (err, created0) => {
        createStates(key1, 3, new Date(), (err, created1) => {

          chai.request(server.listener)
            .get('/api/states/last')
            .end((err, res) => {
              expect(res.status).to.be.equal(200);
              expect(res.body).to.be.an('object');

              expect(Object.keys(res.body).length).to.be.equal(2);

              let lastState0 = res.body[devices[key0].id];
              let lastState1 = res.body[devices[key1].id];

              const check = (actual, expected) => {
                expect(actual).to.be.an('object');
                expect(actual._id).to.be.equal(_.last(expected)._id);

                expect(actual.temperature).to.be.equal(_.last(expected).temperature);
                expect(actual.humidity).to.be.equal(_.last(expected).humidity);
                expect(actual.heatIndex).to.be.equal(_.last(expected).heatIndex);
              };

              check(lastState0, created0);
              check(lastState1, created1);

              done();
            });

          });
      });

    });

  });

  describe('GET /{deviceId}/{year}/{month}/{day}', () => {

    it('must return all states of a device by id for a day', done => {
      clearDB();

      const [key] = Object.keys(devices);
      const deviceId = devices[key].id;

      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate()+1);

      createStates(key, 3, new Date(now), (err, created) => {
        createStates(key, 3, new Date(tomorrow), () => {

          const year = now.getFullYear();
          const month = now.getMonth();
          const day = now.getDate();

          chai.request(server.listener)
            .get(`/api/states/${deviceId}/${year}/${month}/${day}`)
            .end((err, res) => {
              expect(res.status).to.be.equal(200);
              expect(res.body).to.be.an('object');
              expect(Object.keys(res.body).length).to.be.equal(3);

              created.forEach( state => {
                let expected = res.body[state._id];
                expect(state.temperature).to.be.equal(expected[0]);
                expect(state.humidity).to.be.equal(expected[1]);
                expect(state.heatIndex).to.be.equal(expected[2]);
              });

              done();
            });

        });
      });

    });

    it('must return a 404 if device id is wrong', done => {
      chai.request(server.listener)
        .get('/api/states/device-not-found/2016/3/2')
        .end((err, res) => {
          expect(res.status).to.be.equal(404);
          expect(res.body.message).to.be.equal('device-not-found');
          done();
        });
    });

    it('must return a 400 if given date is in future', done => {
      const [key] = Object.keys(devices);
      const deviceId = devices[key].id;

      chai.request(server.listener)
        .get(`/api/states/${deviceId}/${(new Date()).getFullYear()+1}/3/2`)
        .end((err, res) => {
          expect(res.status).to.be.equal(400);
          expect(res.body.message).to.be.equal('cannot-see-the-future-yet');
          done();
        });
    });

  });

  describe('GET /{deviceId}/last24', () => {

    it('must return all states of a device by id for the last 24 hs', done => {
      clearDB();

      const [key] = Object.keys(devices);
      const deviceId = devices[key].id;

      const past = (new Date()).getTime() - (26 * 60 * 60 * 1000);

      createStates(key, 312, new Date(past), (err, created) => {
        chai.request(server.listener)
          .get(`/api/states/${deviceId}/last24`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an('object');
            expect(Object.keys(res.body).length).to.be.equal(288);

            _.takeRight(created, 288).forEach( state => {
              let expected = res.body[state._id];
              expect(state.temperature).to.be.equal(expected[0]);
              expect(state.humidity).to.be.equal(expected[1]);
              expect(state.heatIndex).to.be.equal(expected[2]);
            });

            done();
          });
      });

    });

    it('must return a 404 if device id is wrong', done => {
      chai.request(server.listener)
        .get('/api/states/device-not-found/last24')
        .end((err, res) => {
          expect(res.status).to.be.equal(404);
          expect(res.body.message).to.be.equal('device-not-found');
          done();
        });
    });

  });

});
