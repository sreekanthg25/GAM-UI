import { PayloadLineItemForm } from './formTypes';

function transformDate(date: Date | null) {
  const dt = date ?? new Date();
  return {
    date: {
      year: dt?.getFullYear(),
      month: dt?.getMonth() + 1,
      day: dt?.getDate(),
    },
    hour: dt?.getHours(),
    minute: dt?.getMinutes(),
    second: dt?.getSeconds(),
    timeZoneId: 'Asia/Kolkata',
  };
}

export const transformPayloadData = (data: PayloadLineItemForm): Record<string, unknown> => {
  const { startDate, endDate, cpm, name, creative_placeholders, impressions, booking_id } = data;
  const payload = {
    name,
    booking_id,
    line_item: JSON.stringify({
      startDateTime: {
        ...transformDate(startDate),
      },
      endDateTime: {
        ...transformDate(endDate),
      },
      costPerUnit: {
        currencyCode: 'INR',
        microAmount: cpm * 1000000,
      },
      targeting: {
        inventoryTargeting: {
          targetedAdUnits: [
            {
              adUnitId: '22036727976',
              includeDescendants: true,
            },
          ],
        },
      },
    }),
    primary_goal: {
      goal_type: 'LIFETIME',
      unit_type: 'IMPRESSIONS',
      units: impressions,
    },
    creative_placeholders: creative_placeholders.map(({ size, id /* , type */ }) => ({
      size,
      creative_template_id: id,
      creative_type: id ? 'NATIVE' : 'PIXEL',
    })),
  };
  return payload;
};
