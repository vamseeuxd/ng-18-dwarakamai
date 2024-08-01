import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Observable, of } from "rxjs";
import { getPage, IItem, IVehicle } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class VehiclesService {
  vehicleTypes$: Observable<IItem[]> = of([
    { name: "Two Wheeler", id: "Two Wheeler" },
    { name: "Four Wheeler", id: "Four Wheeler" },
  ]);

  vehicles$: Observable<IVehicle[]> = of([
    {
      name: "AP-39M-4797",
      color: "gray",
      make: "Maruti Celerio",
      flat: "flat_404",
      type: "Four Wheeler",
      id: "Test - 01",
    },
  ]);
  constructor() {}
  getPage(flats: IItem[], vehicles: IVehicle[], vehicleTypes: IItem[]) {
    return getPage(
      "Vehicle",
      "Vehicles",
      "Vehicles",
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
      {
        name: "",
        color: "",
        make: "",
        flat: "",
        type: "",
      },
      (item: IVehicle): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ item.color } color</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ item.make }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ flats.find((f) => f.id == item.flat)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ vehicleTypes.find((v) => v.id == item.type)?.name }</div>`;
      },
      (form: NgForm, valueChanged: string): void => {}
    );
  }
}
