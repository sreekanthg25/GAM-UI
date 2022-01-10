import { atom, atomFamily } from 'Recoil';

import { LineItemFormInputs } from '@/common/formTypes';

export const bookingInfo = atom({
  key: 'booking',
  default: { booking_id: '', name: '' },
});

export const formStep = atom({
  key: 'formStep',
  default: 0,
});

export const showSubmitButton = atom({
  key: 'showSubmitButton',
  default: true,
});

export const lineItemInfo = atom<LineItemFormInputs>({
  key: 'lineItem',
  default: {
    line_item: { name: 'Create New', id: 'new' },
    name: '',
    budget: 0,
    cpm: 0,
    creative_placeholders: [],
    startDate: null,
    endDate: null,
    impressions: 0,
  },
});

export const formSaving = atom({
  key: 'bookingSaving',
  default: false,
});

export const stepCompleted = atomFamily({
  key: 'stepCompleted',
  default: false,
});

export const lineItemId = atom({
  key: 'lineItemId',
  default: '',
});

export const refreshBooking = atom({
  key: 'refreshBooking',
  default: 0,
});
