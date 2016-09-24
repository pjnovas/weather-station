const {
  NODE_ENV,
  PORT,
  HOST,
  DBHOST,
  DBNAME,
  DEVICES
} = process.env;

export default {
  env: NODE_ENV,
  port: PORT || 1337,
  host: HOST || '0.0.0.0',
  dbHost: DBHOST || 'localhost',
  dbName: DBNAME,
  devices: require(DEVICES)
}
