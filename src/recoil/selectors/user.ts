import { selector, DefaultValue } from 'Recoil';

import { setUserData, getToken, getUser, UserArgs, clearUserData } from '@/utils/user';
import { userToken, userData } from '@/recoil/atoms/user';

export const userSelector = selector({
  key: 'userSelector',
  get: ({ get }) => !!get(userToken),
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      clearUserData();
    } else {
      setUserData(newValue as UserArgs<unknown>);
    }
    set(userToken, getToken());
    set(userData, getUser());
  },
});

export const userAdminSelector = selector({
  key: 'userAdminSelector',
  get: ({ get }) => {
    const { role = '' } = get(userData);
    return role.includes('admin');
  },
});
