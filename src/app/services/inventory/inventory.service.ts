import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getPage,
  IFormConfig,
  IInventoryItem,
  IItem,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";

// constants.ts
export const COLLECTION_NAME = "inventoryItem";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Inventory Item";
export const ENTITY_PLURAL_NAME = "Inventory Items";
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
  floor: "",
  status: "",
  cost: null,
};

@Injectable({
  providedIn: "root",
})
export class InventoryService extends FirestoreBase<IInventoryItem> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(
    floors: IItem[],
    inventoryItemStatus: IItem[],
    inventoryItems: IInventoryItem[]
  ) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      inventoryItems,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Inventory Item Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "floor",
          name: "floor",
          defaultValue: "",
          dataProvider: () => floors,
          label: "Item Related Floor",
          required: true,
        },
        {
          type: "dropdown",
          id: "status",
          name: "status",
          defaultValue: "",
          dataProvider: () => inventoryItemStatus,
          label: "Item Status",
          required: true,
        },
        {
          type: "number",
          id: "cost",
          name: "cost",
          defaultValue: null,
          dataProvider: () => [],
          label: "Item Cost Rupees",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item: IInventoryItem): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ floors.find((f) => f.id == item.floor)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ inventoryItemStatus.find((f) => f.id == item.status)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${new Intl.NumberFormat( "en-IN" ).format(item.cost || 0)} ₹</div>`;
      },
      (form: NgForm, valueChanged: string): void => {},
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
