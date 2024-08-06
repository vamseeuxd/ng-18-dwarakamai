import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IExpenses, IInventoryItem, IItem } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import moment from "moment";

// constants.ts
export const COLLECTION_NAME = "expenses";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Expense";
export const ENTITY_PLURAL_NAME = "Expenses";
export const INITIAL_FORM_VALUES = {
  name: "",
  floor: "",
  inventoryItem: "",
  amount: "",
  vendor: "",
};

@Injectable({
  providedIn: "root",
})
export class ExpensesService extends FirestoreBase<IExpenses> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(
    floors: IItem[],
    inventory: IInventoryItem[],
    vendors: IItem[],
    expenses: IExpenses[]
  ) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      expenses,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "New Expense Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "floor",
          name: "floor",
          defaultValue: "",
          dataProvider: () => floors,
          label: "Inventory Item Related Floor",
          required: true,
        },
        {
          type: "dropdown",
          id: "inventoryItem",
          name: "inventoryItem",
          defaultValue: "",
          dataProvider: (form: NgForm) => {
            return inventory.filter((i) => i.floor == form.value.floor);
          },
          label: "Inventory Item",
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
        {
          type: "dropdown",
          id: "vendor",
          name: "vendor",
          defaultValue: "",
          dataProvider: () => vendors,
          label: "Vendor",
          required: true,
        },
        {
          type: "date",
          id: "startDate",
          name: "startDate",
          defaultValue: "",
          dataProvider: () => [],
          label: "Start Date",
          required: true,
        },
        {
          type: "date",
          id: "settledDate",
          name: "settledDate",
          defaultValue: "",
          dataProvider: () => [],
          label: "Settled Date",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item: IExpenses): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-3 border-bottom">${item.name}</h6>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount : ${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Inventory Item : ${ inventory.find((f) => f.id == item.inventoryItem)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Floor : ${ floors.find((f) => f.id == item.floor)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Vendor : ${ vendors.find((f) => f.id == item.vendor)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Start Date : ${ moment(item.startDate).format('DD-MMMM-yyyy')  }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Settled Date : ${ moment(item.settledDate).format('DD-MMMM-yyyy') }</div>
                `;
      },
      (form: NgForm, valueChanged: string): void => {
        if (valueChanged === "floor") {
          form.controls.inventoryItem.setValue("");
        }
      },
      {
        showDeleteMenu: true,
        showEditMenu: true,
      },
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}
