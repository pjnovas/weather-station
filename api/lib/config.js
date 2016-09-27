const {
  NODE_ENV,
  PORT,
  HOST,
  DBHOST,
  DBNAME,
  DEVICES,
  OWMAPI
} = process.env;

let owmapi = { enabled: false };
if (OWMAPI){
  owmapi = require(OWMAPI);
}

export default {
  env: NODE_ENV,
  port: PORT || 1337,
  host: HOST || '0.0.0.0',
  dbHost: DBHOST || 'localhost',
  dbName: DBNAME,
  devices: require(DEVICES),
  owmapi
}
