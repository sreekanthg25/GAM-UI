import { selectorFamily } from 'Recoil';

import { refreshCreatives } from '../atoms/creatives';

import api from '@/utils/api';

export const getCreative = selectorFamily({
  key: 'getCreative',
  get: (creativeId) => async () => {
    try {
      return await api.get(`/basilisk/v0/creative/${String(creativeId)}`);
    } catch (err) {
      console.log(err);
      return {};
    }
  },
});

export const creativesByLineItem = selectorFamily({
  key: 'creativesByLineItem',
  get:
    (lineItemId) =>
    async ({ get }) => {
      try {
        get(refreshCreatives);
        return await api.get(`/basilisk/v0/creatives/lineitem/${String(lineItemId)}`);
      } catch (err) {
        console.log(err);
        return [];
      }
    },
});
