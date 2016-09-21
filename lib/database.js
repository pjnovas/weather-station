import mongoose from 'mongoose';
import Promise from 'bluebird';
import { dbHost, dbName } from 'lib/config';

const dbUrl = `mongodb://${dbHost}/${dbName}`;
mongoose.connect(dbUrl);

mongoose.Promise = Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function callback() {
  console.log(`Connection with database ${dbUrl} succeeded.`);
});

exports.mongoose = mongoose;
exports.db = db;
