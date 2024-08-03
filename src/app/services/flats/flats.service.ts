import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IFormConfig, IItem } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";

// constants.ts
export const COLLECTION_NAME = "flats";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Flat";
export const ENTITY_PLURAL_NAME = "Flats";
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
export const INITIAL_FORM_VALUES = { name: "" };

@Injectable({
  providedIn: "root",
})
export class FlatsService extends FirestoreBase<IItem> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(flats: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      flats,
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
