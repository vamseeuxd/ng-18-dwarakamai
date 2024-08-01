import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IInventoryItem, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class InventoryService {
  inventory: IInventoryItem[] = [
    {
      name: "Test",
      floor: "floor_1",
      status: "Working",
      cost: 5000,
      id: "1722525320025",
    },
    {
      name: "Test - 2",
      floor: "floor_2",
      status: "Working",
      cost: 1000,
      id: "1722525335681",
    },
  ];

  inventoryItemStatus: IItem[] = [
    { name: "Working", id: "Working" },
    { name: "Not Working", id: "Not Working" },
  ];

  constructor() {}
  getPage(floors: IItem[], inventoryItemStatus: IItem[]) {
    return getPage(
      "Inventory Item",
      "inventory",
      "Inventory",
      this.inventory,
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
      {
        name: "",
        floor: "",
        status: "",
        cost: null,
      },
      (item: IInventoryItem): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ floors.find((f) => f.id == item.floor)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ inventoryItemStatus.find((f) => f.id == item.status)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${new Intl.NumberFormat( "en-IN" ).format(item.cost || 0)} ₹</div>`;
      },
      (form: NgForm, valueChanged: string): void => {}
    );
  }
}
