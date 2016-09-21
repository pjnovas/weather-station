import Joi from 'joi';
import Boom from 'boom';
import _ from 'lodash';
import Promise from 'bluebird';

import { State } from 'lib/models';
import { devices } from 'lib/config';

exports.create = {
  auth: 'simple',
  validate: {
    payload: {
      t: Joi.number().required(),
      h: Joi.number().required()
    }
  },
  handler: async (request, reply) => {
    try {
      let newState = new State({
        device: request.auth.credentials.token,
        fahrenheit: request.payload.t,
        humidity: request.payload.h,
        celsius: _.round((request.payload.t - 32) / 1.8, 1)
      });

      await newState.save();
      reply().code(204);

    } catch(err) {
      return reply(Boom.badImplementation(err));
    }
  }
};

exports.findLast = {
  handler: (request, reply) => {
    const _devices = Object.keys(devices);

    const qList = _devices.map( device =>
      State.findOne({ device }).sort('-createdAt')
    );

    Promise.all(qList).spread( function() {
      let args = arguments;
      let exp = _devices.reduce( (obj, device, i) => {
        obj[device] = args[i].toJSON && args[i].toJSON() || {};
        delete obj[device]._id;
        return obj;
      }, {});

      reply(exp);
    })
    .catch(function(err){
      reply(Boom.badImplementation(err));
    });
  }
};
