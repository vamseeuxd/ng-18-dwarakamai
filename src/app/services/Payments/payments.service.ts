import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getPage,
  IFormConfig,
  IIncome,
  IItem,
  IPayment,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";

// constants.ts
export const COLLECTION_NAME = "payments";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Payment";
export const ENTITY_PLURAL_NAME = "Payments";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "New Flat Name",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = {
  flatId: "",
  incomeId: "",
  paid: false,
  paymentDate: "",
  name: "",
};

@Injectable({
  providedIn: "root",
})
export class PaymentsService extends FirestoreBase<IPayment> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(payments: IPayment[], incomes: IIncome[], flats: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      payments,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Payment Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "income",
          name: "income",
          defaultValue: "",
          dataProvider: () => incomes,
          label: "Selecte Income",
          required: true,
        },
        {
          type: "dropdown",
          id: "flat",
          name: "flat",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Select Flat",
          required: true,
        },
        {
          type: "date",
          id: "paymentDate",
          name: "paymentDate",
          defaultValue: null,
          dataProvider: () => [],
          label: "Selecte Payment Date",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item) => item.name,
      (form: NgForm, valueChanged: string): void => {},
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}
