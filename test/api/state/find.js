import chai from 'chai';
import chaiHttp from 'chai-http';
import _ from 'lodash';

import { devices } from 'lib/config';
import { State } from 'lib/models';

const server = require('lib/index');
const expect = chai.expect;

chai.use(chaiHttp);

let dummyStates = {};

describe('GET /states', () => {

  before( async () => {
    await State.remove({});

    Object.keys(devices).forEach( async (device) => {
      _.times(3, async () => {

        let st = new State({
          device,
          celsius: _.random(0, 40),
          fahrenheit: _.random(32, 90),
          humidity: _.random(0, 100),
        });

        await st.save();

        if (!dummyStates[device]){
          dummyStates[device] = [];
        }

        dummyStates[device].push(st.toJSON());
      });
    });

  });

  after( async () => await State.remove({}));

  describe('GET /states/last', () => {

    it('must return the last state by device', done => {
      chai.request(server.listener)
        .get('/api/states/last')
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.be.an('object');
          expect(Object.keys(res.body).length).to.be.equal(
            Object.keys(devices).length);

          Object.keys(devices).forEach( device => {
            expect(res.body[device]).to.be.an('object');
            // TODO: Test sort of createdAt
          });

          done();
        });
    });

  });

});
