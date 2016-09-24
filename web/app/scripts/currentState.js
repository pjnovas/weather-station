import axios from 'axios';
import moment from 'moment';
import Handlebars from 'handlebars';
import { apiURL, refresh, deviceId } from './config.json';

const REFRESH_TIME = refresh * 60 * 1000; // ms

let timer, template;

const render = data => {
  let state = data.state;
  if (state && state._id){
    data.state._id = moment(new Date(state._id)).format('HH:mm');
  }

  $('#current-state').empty().append(template(data));
};

const fetchData = () => {
  render({ loading: true });

  const count = () => {
    axios.get(`${apiURL}/states/last`)
      .then( res => render({ loading: false, state: res.data[deviceId] }))
      .catch( data => render({ loading: false, error: data.message }));

    clearTimeout(timer);
    timer = setTimeout(count, REFRESH_TIME);
  };

  count();
};

const load = () => {
  template = Handlebars.compile($('#current-state-template').html());
  fetchData();
};

export default {
  load
};
