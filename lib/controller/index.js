import Joi from 'joi';
import Boom from 'boom';
import Promise from 'bluebird';
import _ from 'lodash';
import { State } from 'lib/models';
import { devices } from 'lib/config';

exports.create = {
  auth: 'simple',
  validate: {
    payload: {
      temperature: Joi.number().required(),
      humidity: Joi.number().required(),
      heatIndex: Joi.number().required()
    }
  },
  handler: async (request, reply) => {
    try {
      let newState = new State({
        device: request.auth.credentials.token,
        localIP: request.headers['x-local-ip'],
        publicIP: request.info.remoteAddress,
        ...request.payload
      });

      await newState.save();
      //console.dir(_.omit(newState.toJSON(), ['_id']));
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
