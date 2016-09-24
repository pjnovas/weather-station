import moment from 'moment';
import 'moment-round';
const format = moment.ISO_8601;

export const floorTime = (date, precision, by) => {
  let time = moment(date, format);
  time.floor(precision, by);
  return time.toDate();
};
