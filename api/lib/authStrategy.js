import AuthBearer from 'hapi-auth-bearer-token';
import { devices } from 'lib/config';

export default server => {

  server.register(AuthBearer, () => {

    server.auth.strategy('simple', 'bearer-access-token', {
      allowQueryToken: false,
      validateFunc: function (token, callback) {

        if (Object.keys(devices).indexOf(token) > -1){
          return callback(null, true, { token });
        }

        return callback(null, false);
      }
    });
  });

};
