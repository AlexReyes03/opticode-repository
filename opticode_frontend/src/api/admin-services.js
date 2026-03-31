import request from './fetch-wrapper';

export const getUsers = () =>
  request('/api/users/', { method: 'GET' });

export const suspendUser = (id) =>
  request(`/api/users/${id}/suspend/`, { method: 'POST' });
