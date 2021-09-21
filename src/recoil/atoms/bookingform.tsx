import { atom } from 'Recoil';

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

export const lineItemInfo = atom({
  key: 'lineItem',
  default: {
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
