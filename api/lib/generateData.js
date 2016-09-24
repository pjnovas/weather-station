import _ from 'lodash';
import { devices } from 'lib/config';
import { Clock } from 'lib/models';

const db = require('lib/database').db;
const device = Object.keys(devices)[0];

const createStates = (howMany, fromDate, done) => {
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

// for the last 26 hours
const past = (new Date()).getTime() - (26 * 60 * 60 * 1000);
createStates(312, new Date(past), (err, created) => {
  console.log(`Generated ${created.length} states`);
  process.exit();
});
