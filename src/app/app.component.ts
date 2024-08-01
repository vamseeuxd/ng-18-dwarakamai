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
import {
  IItem,
  IVehicle,
  IIncome,
  IInventoryItem,
  IPage,
  IDefaultValues,
  getPage,
  IExpenses,
  getItemNameById,
} from "./interfaces";
import moment from "moment";
import { FlatsService } from "./services/flats/flats.service";
import { FloorsService } from "./services/floors/floors.service";
import { VendorsService } from "./services/vendors/vendors.service";
import { ExpensesService } from "./services/expenses/expenses.service";
import { InventoryService } from "./services/inventory/inventory.service";
import { VehiclesService } from "./services/Vehicles/vehicles.service";
import { IncomeService } from "./services/income/income.service";

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
  readonly flatsService = inject(FlatsService);
  readonly floorsService = inject(FloorsService);
  readonly vendorsService = inject(VendorsService);
  readonly expensesService = inject(ExpensesService);
  readonly inventoryService = inject(InventoryService);
  readonly vehiclesService = inject(VehiclesService);
  readonly incomeService = inject(IncomeService);
  getItemNameById = getItemNameById;

  pages: IPage[] = [
    this.flatsService.getPage(),
    this.floorsService.getPage(),
    this.vendorsService.getPage(),
    this.expensesService.getPage(this.floorsService.floors, this.inventoryService.inventory, this.vendorsService.vendors),
    this.incomeService.getPage(this.flatsService.flats),
    this.inventoryService.getPage(this.floorsService.floors, this.inventoryService.inventoryItemStatus),
    this.vehiclesService.getPage(this.flatsService.flats),
  ];
  activePage: IPage = this.pages[3];

  addItem(
    addOrEditDialogRef: TemplateRef<any>,
    defaultValues: IDefaultValues,
    isEdit = false
  ) {
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
}
