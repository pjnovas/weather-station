const {
  NODE_ENV,
  PORT,
  HOST,
  DBHOST,
  DBNAME,
  DEVICES
} = process.env;

export default {
  env: NODE_ENV || 'development',
  port: PORT || 1337,
  host: HOST || '0.0.0.0',
  dbHost: DBHOST || 'localhost',
  dbName: DBNAME || 'weatherstation',
  devices: require(DEVICES)
}
