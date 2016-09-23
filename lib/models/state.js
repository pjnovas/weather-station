
'use strict';

import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema({
  device: { type: String, required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  heatIndex: { type: Number },
  localIP: { type: String },
  publicIP: { type: String }
}, { timestamps: true, toJSON: { virtuals: true, versionKey: false } });

export default mongoose.model('State', StateSchema);
