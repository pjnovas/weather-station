
import { db } from 'lib/database';
import { devices } from 'lib/config';
import { floorTime } from './clock';
import Promise from 'bluebird';

export const save = (device, date, data, done) => {
  const storeBy = devices[device].storeBy;
  const [key] = Object.keys(storeBy);

  data._id = floorTime(date, storeBy[key], key).getTime();
  db[`states_${device}`].save(data, done);
};

export const findLast = device => {
  return new Promise( resolve => {
    db[`states_${device}`].find().limit(1)
      .sort({ _id: -1 }, (e, [ lastStatus ]) => resolve(lastStatus));
  });
};

export const findByDay = (device, date, done) => {
  const $gt = date.getTime();

  let $lt = new Date($gt);
  $lt.setHours(24);
  $lt = $lt.getTime();

  db[`states_${device}`].find({ _id : { $gt, $lt } }).sort({ _id: 1 }, done);
};

export const findLast24 = (device, date, done) => {
  const $gt = new Date(date.getTime() - (24 * 60 * 60 * 1000)).getTime();
  const $lt = (new Date(date)).getTime();
  
  db[`states_${device}`].find({ _id : { $gt, $lt } }).sort({ _id: 1 }, done);
};
