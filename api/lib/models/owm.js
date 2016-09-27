// Open Weather Map API

import { db } from 'lib/database';
import Promise from 'bluebird';
import axios from 'axios';
import { floorTime } from './clock';

import { owmapi } from 'lib/config';
const { enabled, apiKey, cityId, storeBy } = owmapi;

export const fetchAndSave = date => {
  if (!enabled) return Promise.resolve();

  return new Promise( (resolve, reject) => {
    axios
      .get(`http://api.openweathermap.org/data/2.5/weather?id=${cityId}&APPID=${apiKey}&units=metric`)
      .then( res => {
        //console.dir(res.data);

        const [key] = Object.keys(storeBy);
        db.states_owm_data.save({
          _id: floorTime(date, storeBy[key], key).getTime(),
          temperature: res.data.main.temp,
          humidity: res.data.main.humidity
        }, () => resolve());
      })
      .catch( err => {
        console.log('Error on fetching OpenWeatherMap');
        console.dir(err);
        reject();
      });
  });
};
