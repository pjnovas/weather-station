import {
  create,
  findLast,
  findLast24,
  findByDay
} from 'lib/controller';

const BASE = '/api';

export default [
  { method: 'GET', path: `${BASE}/states/last`, config: findLast },
  { method: 'GET', path: `${BASE}/states/{deviceId}/last24`, config: findLast24 },
  { method: 'GET', path: `${BASE}/states/{deviceId}/{year}/{month}/{day}`, config: findByDay },
  { method: 'POST', path: `${BASE}/states`, config: create }
];
