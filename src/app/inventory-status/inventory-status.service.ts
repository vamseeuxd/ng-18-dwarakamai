import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IFormConfig, IItem } from "src/app/interfaces";
import { FirestoreBase } from "../services/firestore-base";

// constants.ts
export const COLLECTION_NAME = "inventoryItemStatuses";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Inventory Item Status";
export const ENTITY_PLURAL_NAME = "Inventory Item Statuses";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "New Status",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = { name: "" };

@Injectable({
  providedIn: "root",
})
export class InventoryStatusService extends FirestoreBase<IItem> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(inventoryItemStatus: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      inventoryItemStatus,
      FORM_FIELDS,
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
