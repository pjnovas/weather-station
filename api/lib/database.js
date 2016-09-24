import mongojs from 'mongojs';
import { dbHost, dbName } from 'lib/config';
import { devices } from 'lib/config';

const dbUrl = `mongodb://${dbHost}/${dbName}`;
const collections = Object.keys(devices).map( device => `states_${device}` );
const db = mongojs(dbUrl, collections);

exports.db = db;
