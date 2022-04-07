import { selector } from 'Recoil';

import { refreshBooking } from '../atoms/bookingform';

import api from '@/utils/api';

export const orderSelector = selector({
  key: 'orderSelector',
  get: ({ get }) => {
    get(refreshBooking);
    return api.get('/basilisk/v0/bookings');
  },
});
