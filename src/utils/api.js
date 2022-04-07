/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getToken, clearUserData } from './user';

const apiHost = 'api.gamplus.in';

async function api(url, method = 'GET', body = null, options = {}) {
  const token = getToken();
  const urlWithHost = /^(https?:|\/\/)/.test(url) ? url : `//${apiHost}${url}`;
  const response = await fetch(`${urlWithHost}`, {
    method,
    ...(body && (options.formData ? { body } : { body: JSON.stringify(body) })),
    headers: {
      ...(!options.formData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: token }),
    },
  });
  if (!response.ok) {
    const resp = await response.json();
    if (resp.status === 401) {
      clearUserData();
    }
    throw resp;
  }
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default {
  get: api,
  post: (url, body, options) => api(url, 'POST', body, options),
  put: (url, body) => api(url, 'PUT', body),
  patch: (url, body) => api(url, 'PATCH', body),
  delete: (url) => api(url, 'DELETE'),
};
