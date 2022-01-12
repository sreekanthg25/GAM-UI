import { PayloadLineItemForm, CreativeFormTypes, TemplateVar, ImageType, CreativeValidatorType } from './formTypes';

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

/* function getArrayKeyValue(arr = [], obj: Record<string, string | ImageType>, key = '') {
  return arr.map((v) => {
    const keyName: string = v[key] ?? v;
    return [keyName, obj[keyName]];
  });
} */

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

export const transformCreativesPayload = (
  creatives: CreativeFormTypes['creatives'],
  variables: TemplateVar[],
): Record<string, unknown>[] => {
  return creatives.map((creative) => {
    const assets = variables.filter((v) => v.type === 'Asset' && creative[v.unique_name]);
    const urls = variables.filter((v) => v.type === 'Url' && creative[v.unique_name]);
    const strings = variables.filter((v) => v.type === 'String' && creative[v.unique_name]);
    const long = variables.filter((v) => v.type === 'Long' && creative[v.unique_name]);
    const isNativeAd = variables.find((v) => v.type === 'NATIVE_URL');
    const { image_meta = { width: 300, height: 250 } } = creative['Image'] as ImageType;
    const { Width, Height } = creative;
    return {
      creative_name: creative.name,
      ...(!isNativeAd && {
        size: Width && Height ? { width: Number(Width), height: Number(Height) } : image_meta,
      }),
      ...(isNativeAd && { dest_url: creative[isNativeAd.unique_name] }),
      asset_creative_template_variables: assets.map((v) => [v.unique_name, creative[v.unique_name]]),
      string_creative_template_variables: strings.map((v) => [v.unique_name, creative[v.unique_name]]),
      url_creative_template_variables: urls.map((v) => [v.unique_name, creative[v.unique_name]]),
      long_creative_template_variables: long.map((v) => [v.unique_name, Number(creative[v.unique_name])]),
    };
  });
};

export const validateCreativeSizes = (
  creatives: CreativeFormTypes['creatives'],
  sizes: string | string[],
): CreativeValidatorType => {
  if (!sizes.length) {
    return {};
  }
  return creatives.reduce((acc, creative, idx) => {
    const { Width, Height } = creative;
    if (Width && Height && !sizes.includes(`${Width}x${Height}`)) {
      acc.errors = acc.errors || new Array(creatives.length);
      acc.errors[idx] = true;
    }
    return acc;
  }, {} as CreativeValidatorType);
};
