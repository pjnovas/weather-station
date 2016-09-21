import {
  create,
  findLast
} from 'lib/controller';

const BASE = '/api';

export default [
  { method: 'GET', path: `${BASE}/states/last`, config: findLast },
  { method: 'POST', path: `${BASE}/states`, config: create }
];
