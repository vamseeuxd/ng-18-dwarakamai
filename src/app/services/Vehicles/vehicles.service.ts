import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IFormConfig, IItem, IVehicle } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";

// constants.ts
export const COLLECTION_NAME = "vehicles";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Vehicle";
export const ENTITY_PLURAL_NAME = "Vehicles";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vehicle Name",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = {
  name: "",
  color: "",
  make: "",
  flat: "",
  type: "",
};

@Injectable({
  providedIn: "root",
})
export class VehiclesService extends FirestoreBase<IVehicle> {
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(flats: IItem[], vehicles: IVehicle[], vehicleTypes: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      vehicles,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Vehicle Number",
          required: true,
        },
        {
          type: "text",
          id: "color",
          name: "color",
          defaultValue: "",
          dataProvider: () => [],
          label: "Vehicle Color",
          required: true,
        },
        {
          type: "text",
          id: "make",
          name: "make",
          defaultValue: "",
          dataProvider: () => [],
          label: "Vehicle Make",
          required: true,
        },
        {
          type: "dropdown",
          id: "flat",
          name: "flat",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Vehicle Related Flat",
          required: true,
        },
        {
          type: "dropdown",
          id: "type",
          name: "type",
          defaultValue: "",
          dataProvider: () => vehicleTypes,
          label: "Vehicle Type",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item: IVehicle): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ item.color } color</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ item.make }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ flats.find((f) => f.id == item.flat)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ vehicleTypes.find((v) => v.id == item.type)?.name }</div>`;
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
