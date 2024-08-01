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
import {MatAutocompleteModule} from '@angular/material/autocomplete';
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

export interface IPage {
  signlerName: string;
  id: string;
  name: string;
  items: IItem[];
  formConfig: IFormConfig[];
  defaultValues: Record<string, string | number | boolean>;
}

export interface IFormConfig {
  type: "text" | "dropdown";
  id: string;
  name: string;
  label: string;
  required: boolean;
  defaultValue: string;
  dataProvider: IItem[];
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
    CdkDrag,
  ],
})
export class AppComponent {
  readonly dialog = inject(MatDialog);
  flats: IItem[] = [
    { name: "Flat 101", id: "flat_101", },
    { name: "Flat 102", id: "flat_102", },
    { name: "Flat 103", id: "flat_103", },
    { name: "Flat 104", id: "flat_104", },
    { name: "Flat 201", id: "flat_201", },
    { name: "Flat 202", id: "flat_202", },
    { name: "Flat 203", id: "flat_203", },
    { name: "Flat 204", id: "flat_204", },
    { name: "Flat 301", id: "flat_301", },
    { name: "Flat 302", id: "flat_302", },
    { name: "Flat 303", id: "flat_303", },
    { name: "Flat 304", id: "flat_304", },
    { name: "Flat 401", id: "flat_401", },
    { name: "Flat 402", id: "flat_402", },
    { name: "Flat 403", id: "flat_403", },
    { name: "Flat 404", id: "flat_404", },
  ];

  floors: IItem[] = [
    { name: "Floor 1", id: "floor_1", },
    { name: "Floor 2", id: "floor_2", },
    { name: "Floor 3", id: "floor_3", },
    { name: "Floor 4", id: "floor_4", }
  ];

  /* prettier-ignore */
  pages: IPage[] = [
    {
      signlerName: "Flat",
      id: "flats",
      name: "Flats",
      items: this.flats,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Flat Name", required: true }
      ],
      defaultValues: { name:'' }
    },
    {
      signlerName: "Floor", id: "floors", name: "Floors", items: this.floors,
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Floor Name", required: false }
      ],
      defaultValues: { name:'' }
    },
    {
      signlerName: "Expense", id: "expenses", name: "Expenses", items: [],
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Expense Name", required: false }
      ],
      defaultValues: { name:'' }
    },
    {
      signlerName: "Income", id: "income", name: "Income", items: [],
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Income Name", required: false }
      ],
      defaultValues: { name:'' }
    },
    {
      signlerName: "Inventor Item",
      id: "inventory",
      name: "Inventory",
      items: [],
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Inventor Item Name", required: false }
      ],
      defaultValues: { name:'' }
    },
    {
      signlerName: "Vehical", id: "vehicals", name: "Vehicals", items: [],
      formConfig: [
        { type: "text", id: "name", name: "name", defaultValue: "", dataProvider: [], label: "New Vehical Name", required: false },
        { type: "dropdown", id: "floor", name: "flat", defaultValue: "", dataProvider: this.flats, label: "Vehical Related Flat", required: false },
      ],
      defaultValues: { name:'' }
    },
  ];
  activePage: IPage = this.pages[0];

  addItem(
    addOrEditDialogRef: TemplateRef<any>,
    defaultValues: Record<string, string | number | boolean>,
    isEdit = false
  ) {
    const dialogRef = this.dialog.open(addOrEditDialogRef, {
      data: {
        title: `Add New ${this.activePage.signlerName}`,
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
                name: newForm.value.name.trim(),
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

  displayFn(item: IItem): string {
    console.log(item);
    return item && item.name ? item.name : '';
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
}
