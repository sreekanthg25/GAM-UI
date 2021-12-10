import { atom } from 'Recoil';

import { getToken, getUser } from '@/utils/user';

export const userToken = atom({
  key: 'token',
  default: getToken() || null,
});

export const userData = atom({
  key: 'userData',
  default: getUser() || null,
});
