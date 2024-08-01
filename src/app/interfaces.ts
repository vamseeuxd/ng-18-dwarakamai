import { NgForm } from "@angular/forms";

export interface IItem {
  id: string;
  name: string;
}

export interface IVehicle extends IItem {
  color: string;
  make: string;
  flat: string;
  type: string;
}

export interface IIncome extends IItem {
  month: string;
  flats: string[];
  amount: number;
}

export interface IInventoryItem extends IItem {
  name: string;
  floor: string;
  status: string;
  cost: null | number;
}
export interface IExpenses extends IItem {
  floor: string;
  inventoryItem: string;
  amount: number;
  vendor: string;
  startDate: string;
  settledDate: string;
}

export type IDefaultValues = Record<
  string,
  string | number | boolean | null | string[]
>;

export interface IPage {
  signlerName: string;
  id: string;
  name: string;
  itemLabelCallBack: (item: any) => string;
  items: IItem[];
  formConfig: IFormConfig[];
  onFormChange: (form: NgForm, valueChanged: string) => void;
  defaultValues: IDefaultValues;
}

export interface IFormConfig {
  type: "text" | "dropdown" | "number" | "month" | "multi-select" | "date";
  id: string;
  name: string;
  label: string;
  required: boolean;
  defaultValue: string | number | null;
  dataProvider: (form: NgForm) => IItem[];
}

export const getPage = (
  signlerName: string,
  id: string,
  name: string,
  items: IItem[],
  formConfig: IFormConfig[],
  defaultValues: IDefaultValues,
  itemLabelCallBack: (item: any) => string,
  onFormChange: (form: NgForm, valueChanged: string) => void
): IPage => {
  return {
    signlerName,
    id,
    name,
    items,
    formConfig,
    defaultValues,
    itemLabelCallBack,
    onFormChange,
  };
};
