import { selector, selectorFamily } from 'Recoil';

import { refreshLineItems } from '../atoms/lineitems';

import api from '@/utils/api';

export const lineItemsSelector = selector({
  key: 'lineItemsSelector',
  get: ({ get }) => {
    get(refreshLineItems);
    return api.get('/basilisk/v0/lineitems');
  },
});

export const lineItemsByOrderId = selectorFamily({
  key: 'lineItemsByOrderId',
  get:
    (orderId) =>
    ({ get }) => {
      get(refreshLineItems);
      return api.get(`/basilisk/v0/lineitems/booking/${String(orderId)}`);
    },
});
