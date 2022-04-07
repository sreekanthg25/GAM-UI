import { selector } from 'Recoil';

import { refreshConfigs } from '../atoms/configs';

import api from '@/utils/api';

export const configsSelector = selector({
  key: 'configsSelector',
  get: ({ get }) => {
    get(refreshConfigs);
    return api.get('/basilisk/v0/account/metadata');
  },
});
