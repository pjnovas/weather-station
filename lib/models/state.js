
'use strict';

import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema({
  device: { type: String, required: true },
  celsius: { type: Number },
  fahrenheit: { type: Number },
  humidity: { type: Number }
}, { timestamps: true, toJSON: { virtuals: true, versionKey: false } });

export default mongoose.model('State', StateSchema);
