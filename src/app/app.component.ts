import { Component, inject, TemplateRef, viewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, NgForm } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { NgPipesModule } from "ngx-pipes";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";

export interface IItem {
  id: string;
  name: string;
}

export interface IVehicle extends IItem {
  color: string;
  make: string;
  flat: string;
  type: string;
}

export interface IIncome extends IItem {
  month: string;
  flats: string[];
  amount: number;
}

export interface IInventoryItem extends IItem {
  name: string;
  floor: string;
  status: string;
  cost: null | number;
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
}

export interface IFormConfig {
  type: "text" | "dropdown" | "number" | "month" | "multi-select";
  id: string;
  name: string;
  label: string;
  required: boolean;
  defaultValue: string | number | null;
  dataProvider: (form: NgForm) => IItem[];
}

@Component({
  selector: "app-component",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  standalone: true,
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    CommonModule,
    MatAutocompleteModule,
    NgPipesModule,
    MatMenuModule,
    MatSelectModule,
    CdkDrag,
  ],
})
export class AppComponent {
  readonly dialog = inject(MatDialog);
  flats: IItem[] = [
    { name: "Flat 101", id: "flat_101" },
    { name: "Flat 102", id: "flat_102" },
    { name: "Flat 103", id: "flat_103" },
    { name: "Flat 104", id: "flat_104" },
    { name: "Flat 201", id: "flat_201" },
    { name: "Flat 202", id: "flat_202" },
    { name: "Flat 203", id: "flat_203" },
    { name: "Flat 204", id: "flat_204" },
    { name: "Flat 301", id: "flat_301" },
    { name: "Flat 302", id: "flat_302" },
    { name: "Flat 303", id: "flat_303" },
    { name: "Flat 304", id: "flat_304" },
    { name: "Flat 401", id: "flat_401" },
    { name: "Flat 402", id: "flat_402" },
    { name: "Flat 403", id: "flat_403" },
    { name: "Flat 404", id: "flat_404" },
  ];

  floors: IItem[] = [
    { name: "Floor 1", id: "floor_1" },
    { name: "Floor 2", id: "floor_2" },
    { name: "Floor 3", id: "floor_3" },
    { name: "Floor 4", id: "floor_4" },
    { name: "Ground Floor", id: "Ground Floor" },
    { name: "Building", id: "Building" },
  ];

  vehicleTypes: IItem[] = [
    { name: "Two Wheeler", id: "Two Wheeler" },
    { name: "Four Wheeler", id: "Four Wheeler" },
  ];

  inventoryItemStatus: IItem[] = [
    { name: "Working", id: "Working" },
    { name: "Not Working", id: "Not Working" },
  ];

  vehicles: IVehicle[] = [
    {
      name: "AP-39M-4797",
      color: "gray",
      make: "Maruti Celerio",
      flat: "flat_404",
      type: "Four Wheeler",
      id: "Test - 01",
    },
  ];

  incomes: IIncome[] = [
    {
      id: "December 2024 Montly Maintainence",
      name: "December 2024 Montly Maintainence",
      month: "2024-12",
      flats: [
        "flat_101",
        "flat_102",
        "flat_103",
        "flat_104",
        "flat_201",
        "flat_202",
        "flat_203",
        "flat_204",
        "flat_301",
        "flat_302",
        "flat_303",
        "flat_304",
        "flat_401",
        "flat_402",
        "flat_403",
        "flat_404",
      ],
      amount: 1500,
    },
  ];

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

  expenses: IItem[] = [];

  /* prettier-ignore */
  pages: IPage[] = [
    {
      signlerName: "Flat",
      id: "flats",
      name: "Flats",
      items: this.flats,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "New Flat Name", required: true }
      ],
      defaultValues: { name: '' },
      itemLabelCallBack: (item: IItem): string => {
        return item.name;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {}
    },
    {
      signlerName: "Floor", id: "floors", name: "Floors", items: this.floors,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "New Floor Name", required: false }
      ],
      defaultValues: { name: '' },
      itemLabelCallBack: (item: IItem): string => {
        return item.name;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {}
    },
    {
      signlerName: "Expense", id: "expenses", name: "Expenses", items: this.expenses,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "New Expense Name", required: false },
        { type: "dropdown", id: "floor", name: "floor", defaultValue: "", dataProvider: () => this.floors, label: "Inventory Item Related Floor", required: true },
        {
          type: "dropdown", id: "inventoryItem", name: "inventoryItem", defaultValue: "", 
          dataProvider: (form: NgForm) => {
            return this.inventory.filter(i => i.floor == form.value.floor);
          }, label: "Inventory Item", required: true
        },
        { type: "number", id: "amount", name: "amount", defaultValue: null, dataProvider: () => [], label: "Amount in ₹", required: true },
      ],
      defaultValues: { name: '' },
      itemLabelCallBack: (item: IItem): string => {
        return item.name;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {
        if(valueChanged === 'floor'){
          form.controls.inventoryItem.setValue('');
        }        
      }
    },
    {
      signlerName: "Income", id: "income", name: "Income", items: this.incomes,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "Income Name", required: true },
        { type: "month", id: "month", name: "month", defaultValue: "", dataProvider: () => [], label: "Income Month", required: true },
        { type: "multi-select", id: "flats", name: "flats", defaultValue: "", dataProvider: () => this.flats, label: "Flats to Pay", required: true },
        { type: "number", id: "amount", name: "amount", defaultValue: null, dataProvider: () => [], label: "Amount in ₹", required: true },
      ],
      defaultValues: {
        name: '',
        id: '',
        month: '',
        flats: [],
        amount: 0,
      },
      itemLabelCallBack: (item: IIncome): string => {
        return `<h6 class="mb-2 pb-3 border-bottom">${(item).name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for Flat : ${new Intl.NumberFormat('en-IN').format(item.amount || 0)} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for ${item.flats.length} Flats : ${new Intl.NumberFormat('en-IN').format(item.amount * item.flats.length || 0)} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Month : ${item.month}</div>
        <div class="p-2 m-2 border shadow-sm">
          <p class="m-0 p-0 border-bottom pb-1 mb-1">Flats Needs to Pay : </p>
          ${item.flats.map(f => {
          return `<div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${this.getItemNameById(this.flats, f)}</div>`;
        }).join('')}
        </div>
        `;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {}
    },
    {
      signlerName: "Inventory Item",
      id: "inventory",
      name: "Inventory",
      items: this.inventory,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "Inventory Item Name", required: false },
        { type: "dropdown", id: "floor", name: "floor", defaultValue: "", dataProvider: () => this.floors, label: "Item Related Floor", required: true },
        { type: "dropdown", id: "status", name: "status", defaultValue: "", dataProvider: () => this.inventoryItemStatus, label: "Item Status", required: true },
        { type: "number", id: "cost", name: "cost", defaultValue: null, dataProvider: () => [], label: "Item Cost Rupees", required: true },
      ],
      defaultValues: {
        name: '',
        floor: '',
        status: '',
        cost: null,
      },
      itemLabelCallBack: (item: IInventoryItem): string => {
        return `<h6 class="mb-2 pb-2 border-bottom">${(item).name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${this.floors.find(f => f.id == item.floor)?.name}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${this.inventoryItemStatus.find(f => f.id == item.status)?.name}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${new Intl.NumberFormat('en-IN').format(item.cost || 0)} ₹</div>`;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {}
    },
    {
      signlerName: "Vehicle", id: "Vehicles", name: "Vehicles", items: this.vehicles,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: () => [], label: "Vehicle Number", required: true },
        { type: "text", id: "color", name: "color", defaultValue: "", dataProvider: () => [], label: "Vehicle Color", required: true },
        { type: "text", id: "make", name: "make", defaultValue: "", dataProvider: () => [], label: "Vehicle Make", required: true },
        { type: "dropdown", id: "flat", name: "flat", defaultValue: "", dataProvider: () => this.flats, label: "Vehicle Related Flat", required: true },
        { type: "dropdown", id: "type", name: "type", defaultValue: "", dataProvider: () => this.vehicleTypes, label: "Vehicle Type", required: true },
      ],
      defaultValues: {
        "name": "",
        "color": "",
        "make": "",
        "flat": "",
        "type": "",
      },
      itemLabelCallBack: (item: IVehicle): string => {
        return `<h6 class="mb-2 pb-2 border-bottom">${(item).name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${item.color} color</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${item.make}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${this.flats.find(f => f.id == item.flat)?.name}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${this.vehicleTypes.find(v => v.id == item.type)?.name}</div>`;
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {}
    },
  ];
  activePage: IPage = this.pages[2];

  addItem(
    addOrEditDialogRef: TemplateRef<any>,
    defaultValues: IDefaultValues,
    isEdit = false
  ) {
    console.log(defaultValues);
    const dialogRef = this.dialog.open(addOrEditDialogRef, {
      data: {
        title: `${isEdit ? "Update" : "Add New"} ${
          this.activePage.signlerName
        }`,
        message: `Are you sure! Do you want to delete ${this.activePage.signlerName}?`,
        formConfig: this.activePage.formConfig,
        defaultValues: defaultValues,
        yesClick: (newForm: NgForm) => {
          if (isEdit) {
            if (newForm.valid && newForm.value.name.trim().length > 0) {
              this.activePage.items = this.activePage.items.map((val) => {
                if (val.id === defaultValues.id) {
                  return { ...newForm.value, id: defaultValues.id };
                }
                return val;
              });
              newForm.resetForm({});
              dialogRef.close();
            }
          } else {
            if (newForm.valid && newForm.value.name.trim().length > 0) {
              this.activePage.items.push({
                ...newForm.value,
                id: new Date().getTime().toString(),
              });
              newForm.resetForm({});
              dialogRef.close();
            }
          }
        },
      },
    });
  }

  /* displayFn(item: IItem): string {
    return item && item.name ? item.name : '';
  } */

  displayFn(items: IItem[]): (value: any) => string {
    return (val: any) => {
      const option = items.find((item) => item.id === val);
      return option ? option.name : "";
    };
  }

  deleteItem(item: IItem, deleteConfirmationDialogRef: TemplateRef<any>) {
    const dialogRef = this.dialog.open(deleteConfirmationDialogRef, {
      data: {
        title: " Delete Confirmation",
        message: `Are you sure! Do you want to delete ${this.activePage.signlerName}?`,
        yesClick: () => {
          dialogRef.close();
          this.activePage.items = this.activePage.items.filter(
            (_item) => item.id != _item.id
          );
        },
      },
    });
  }

  getItemNameById(items: IItem[], id: string) {
    return items.find((i) => i.id === id)?.name || "";
  }
}
