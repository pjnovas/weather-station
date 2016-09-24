process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.DBNAME = process.env.DBNAME || 'weather_station';

require('./index.babel');
require('./lib');
