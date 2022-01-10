export type CreativeProps = {
  name: string;
  id: number;
  type: string;
  size: {
    width: number;
    height: number;
  };
};

export type LineItemProps = {
  name: string;
  id: string;
};

export type LineItemFormInputs = {
  line_item: LineItemProps | null;
  name: string;
  creative_placeholders: CreativeProps[];
  budget: number;
  cpm: number;
  impressions: number;
  startDate: Date | null;
  endDate: Date | null;
};

export type PayloadLineItemForm = LineItemFormInputs & {
  booking_id: string;
};

export type TemplateVar = {
  is_required: boolean;
  unique_name: string;
  type: string;
  label: string;
};

export type ImageType = {
  id: string;
  name: string;
  url: string;
  image_meta: {
    width: number;
    height: number;
  };
};

export type CreativeFormTypes = {
  template: CreativeProps | null;
  zip_file: FileList | null | undefined;
  creatives: Record<string, string | ImageType | number>[];
  globalCreatives: Record<string, string>;
  globalVariableConfig: Record<string, string>;
};
