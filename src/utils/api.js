/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getToken, clearUserData } from './user';

async function api(url, method = 'GET', body = null) {
  const token = getToken();
  const response = await fetch(`${url}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
    },
  });
  if (!response.ok) {
    const resp = await response.json();
    if (resp.status === 401) {
      clearUserData();
    }
    throw resp.json();
  }
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default {
  get: api,
  post: (url, body) => api(url, 'POST', body),
  put: (url, body) => api(url, 'PUT', body),
  delete: (url) => api(url, 'DELETE'),
};
