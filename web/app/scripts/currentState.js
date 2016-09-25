import axios from 'axios';
import moment from 'moment';
import Handlebars from 'handlebars';
import regression from 'regression';
//import Point from 'point2js';
import { apiURL, refresh, deviceId } from './config.json';

const REFRESH_TIME = refresh * 60 * 1000; // ms

let timer, template, _lastState = {};

const render = () => {
  if (!_lastState.state) return;

  let state = _lastState.state;
  if (state && state._id){
    _lastState.state.time = moment(new Date(state._id)).format('HH:mm');
  }

  $('#current-state').empty().append(template(_lastState));
};

const fetchData = () => {
  render({ loading: true });

  const count = () => {
    axios.get(`${apiURL}/states/last`)
      .then( res => {
        _lastState = { ..._lastState, loading: false, state: res.data[deviceId] };
        render(_lastState);
      })
      .catch( data => {
        _lastState = { ..._lastState, loading: false, error: data.message }
        render();
      });

    clearTimeout(timer);
    timer = setTimeout(count, REFRESH_TIME);
  };

  count();
};

const load = () => {
  template = Handlebars.compile($('#current-state-template').html());
  fetchData();
};

const getTrending = (data, idx, from) => {
  const keys = Object.keys(data);
  keys.sort();

  let latests = keys.slice(keys.length - from);
  let coords = latests.reduce( (arr, key, i) => {
    arr.push([data[key][idx], i]);
    return arr;
  }, []);

  const { equation } = regression('linear', coords);

  //const pA = new Point([0, equation[1]]);
  //const pB = new Point([equation[0], equation[0]*latests.length + equation[1]]);
  //const vec = pB.subtract(pA); //TODO: to show a vector trending

  const a = -equation[1]/equation[0];
  const b = (-equation[1] + latests.length)/equation[0];

  return b-a;
};

const calculateTrending = data => {
  const last2Hours = 2 * 12; // 12 = sections of 5 min in 1 hour
  const temp = getTrending(data, 0, last2Hours);
  const hum = getTrending(data, 1, last2Hours);
  const hi = getTrending(data, 2, last2Hours);

  _lastState = { ..._lastState, trend: { temp, hum, hi } };
  render();
};

export default {
  load,
  calculateTrending
};
