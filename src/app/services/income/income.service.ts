import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IFormConfig,
  IIncome,
  IItem,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";

// constants.ts
export const COLLECTION_NAME = "income";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Income";
export const ENTITY_PLURAL_NAME = "Income";
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
  name: "",
  id: "",
  month: "",
  flats: [],
  amount: 0,
};

@Injectable({
  providedIn: "root",
})
export class IncomeService extends FirestoreBase<IIncome> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(flats: IItem[], incomes: IIncome[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      incomes,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Income Name",
          required: true,
        },
        {
          type: "month",
          id: "month",
          name: "month",
          defaultValue: "",
          dataProvider: () => [],
          label: "Income Month",
          required: true,
        },
        {
          type: "multi-select",
          id: "flats",
          name: "flats",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Flats to Pay",
          required: true,
        },
        {
          type: "number",
          id: "amount",
          name: "amount",
          defaultValue: null,
          dataProvider: () => [],
          label: "Amount in ₹",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item: IIncome): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-3 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for Flat : ${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for ${ item.flats.length } Flats : ${new Intl.NumberFormat("en-IN").format( item.amount * item.flats.length || 0 )} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Month : ${ item.month }</div>
        <div class="p-2 m-2 border shadow-sm"> <p class="m-0 p-0 border-bottom pb-1 mb-1">Flats Needs to Pay : </p> ${item.flats .map((f) => { return `<div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${getItemNameById( flats, f )}</div>`; }) .join("")} </div> `;
      },
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
