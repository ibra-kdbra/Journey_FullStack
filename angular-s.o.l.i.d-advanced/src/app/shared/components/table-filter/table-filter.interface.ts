export interface IItemForm {
  type: string;
  name: string;
  columns: string[];
  placeholder: string;
  label?: string;
  classes?: string;
  multiple?: boolean;
  search?: boolean;
  searchPlaceholder?: string;
  itemValue?: ITemValue[];
}


export interface ITemValue {
  type: string;
  value: string;
  label: string;
}
