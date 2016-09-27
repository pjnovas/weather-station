import mongojs from 'mongojs';
import { dbHost, dbName } from 'lib/config';
import { devices, owmapi } from 'lib/config';

const dbUrl = `mongodb://${dbHost}/${dbName}`;
const collections = Object.keys(devices).map( device => `states_${device}` );

if (owmapi.enabled){
  collections.push('states_owm_data');
}

const db = mongojs(dbUrl, collections);

exports.db = db;
