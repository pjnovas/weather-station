import Boom from 'boom';
import Joi from 'joi';
import { State, OWM } from 'lib/models';
import { devices } from 'lib/config';
import Promise from 'bluebird';

exports.create = {
  auth: 'simple',
  validate: {
    payload: {
      temperature: Joi.number().required(),
      humidity: Joi.number().required(),
      heatIndex: Joi.number().required()
    }
  },
  handler: (request, reply) => {
    const state = {
      localIP: request.headers['x-local-ip'],
      publicIP: request.info.remoteAddress,
      ...request.payload
    };

    let date = new Date();
    State.save(request.auth.credentials.token, date, state, () => {
      OWM.fetchAndSave(date).then( () => {
        reply().code(204);
      });
    });
  }
};

exports.findLast = {
  handler: (request, reply) => {
    const _devices = Object.keys(devices);
    const qList = _devices.map( device => State.findLast(device) );

    Promise.all(qList).spread( function() {
      let args = arguments;

      let exp = _devices.reduce( (obj, device, i) => {
        const devId = devices[device].id;
        obj[devId] = args[i];
        return obj;
      }, {});

      reply(exp);
    });
  }
};

exports.findByDay = {
  validate: {
    params: {
      deviceId: Joi.string().required(),
      year: Joi.number().required(),
      month: Joi.number().required(),
      day: Joi.number().required()
    }
  },
  handler: ({ params }, reply) => {
    const { deviceId, year, month, day } = params;

    let [device] = Object.keys(devices).filter( device =>
      devices[device].id === deviceId
    );

    if (deviceId === 'owm_data') {
      device = 'owm_data';
    }

    if (!device){
      return reply(Boom.notFound('device-not-found'));
    }

    if (new Date() < new Date(year, month, day)){
      return reply(Boom.badRequest('cannot-see-the-future-yet'));
    }

    const date = new Date(year, month, day);
    State.findByDay(device, date, (err, states) => {
      reply(
        states.reduce( (obj, state) => {
          obj[state._id] = [state.temperature, state.humidity, state.heatIndex];
          return obj;
        }, {})
      );
    });
  }
};

exports.findLast24 = {
  validate: {
    params: {
      deviceId: Joi.string().required()
    }
  },
  handler: ({ params }, reply) => {
    const { deviceId } = params;

    let [device] = Object.keys(devices).filter( device =>
      devices[device].id === deviceId
    );

    if (deviceId === 'owm_data') {
      device = 'owm_data';
    }

    if (!device){
      return reply(Boom.notFound('device-not-found'));
    }

    State.findLast24(device, new Date(), (err, states) => {
      reply(
        states.reduce( (obj, state) => {
          obj[state._id] = [state.temperature, state.humidity, state.heatIndex];
          return obj;
        }, {})
      );
    });
  }
};
