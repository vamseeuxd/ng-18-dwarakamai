import { NgForm } from "@angular/forms";

export interface IItem {
  id?: string;
  name: string;
}

export interface IUser extends IItem {
  email: string;
  mobile: string;
  access: string;
}

export interface IVehicle extends IItem {
  color: string;
  make: string;
  flat: string;
  type: string;
}

export interface IMaintenance extends IItem {
  month: string;
  year: string;
  flats: string[];
  amount: number;
}

export interface IPayment extends IItem {
  flatId: string;
  paid: boolean;
  paymentDate: string;
  maintenanceId: string;
  month: string;
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
  db?: {
    add: (item: IItem) => Promise<void>;
    update: (item: IItem, id: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
    get: (id: string) => Promise<any>;
  };
  contentMenu: {
    showDeleteMenu: boolean;
    showEditMenu: boolean;
    otherMenus?: {
      icon: string;
      name: string;
      disabled: (item: any) => boolean;
      callBack: (item: IItem) => void;
    }[];
  };
  addCallBack: () => void;
  hideAdd?: boolean;
}

export interface IFormConfig {
  type:
    | "text"
    | "textarea"
    | "dropdown"
    | "number"
    | "month"
    | "tel"
    | "multi-select"
    | "date"
    | "hidden";
  id: string;
  name: string;
  getOptionLabel?: (item: any) => string;
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
  onFormChange: (form: NgForm, valueChanged: string) => void,
  contentMenu: {
    showDeleteMenu: boolean;
    showEditMenu: boolean;
    otherMenus?: {
      icon: string;
      name: string;
      disabled: (item: any) => boolean;
      callBack: (item: IItem) => void;
    }[];
  },
  addCallBack: () => void,
  db?: {
    add: (value: any) => Promise<void>;
    update: (value: any, id: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
    get: (id: string) => Promise<any>;
  },
  hideAdd?: boolean
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
    db,
    contentMenu,
    addCallBack,
    hideAdd,
  };
};

export const getItemNameById = (items: IItem[], id: string) => {
  return items.find((i) => i.id === id)?.name || "";
};

export interface IAllCollection {
  flats: IItem[];
  floors: IItem[];
  vendors: IItem[];
  expenses: IExpenses[];
  expenseTypes: IItem[];
  inventory: IInventoryItem[];
  vehicleTypes: IItem[];
  vehicles: IVehicle[];
  maintenances: IMaintenance[];
  inventoryItemStatus: IItem[];
  payments: IPayment[];
  paymentsBy: IItem[];
  users: IUser[];
}

export interface IPageService {
  getPage(allCollection: IAllCollection): IPage;
}
