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

export type CreativeFormTypes = {
  template: CreativeProps | null;
  csv_file: FileList | null | undefined;
  zip_file: FileList | null | undefined;
};
