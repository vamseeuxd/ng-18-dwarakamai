import {
  Component,
  effect,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from "@angular/core";
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
import { IItem, IPage, IDefaultValues, getItemNameById } from "./interfaces";
import { FlatsService } from "./services/flats/flats.service";
import { FloorsService } from "./services/floors/floors.service";
import { VendorsService } from "./services/vendors/vendors.service";
import { ExpensesService } from "./services/expenses/expenses.service";
import { InventoryService } from "./services/inventory/inventory.service";
import { VehiclesService } from "./services/Vehicles/vehicles.service";
import { IncomeService } from "./services/income/income.service";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  user,
  UserCredential,
} from "@angular/fire/auth";
import { combineLatest, map, Observable } from "rxjs";

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
  auth: Auth = inject(Auth);
  readonly dialog = inject(MatDialog);
  readonly flatsService = inject(FlatsService);
  readonly floorsService = inject(FloorsService);
  readonly vendorsService = inject(VendorsService);
  readonly expensesService = inject(ExpensesService);
  readonly inventoryService = inject(InventoryService);
  readonly vehiclesService = inject(VehiclesService);
  readonly incomeService = inject(IncomeService);
  getItemNameById = getItemNameById;

  pages$: Observable<IPage[]> = combineLatest([
    this.flatsService.flats$,
    this.floorsService.floors$,
    this.vendorsService.vendors$,
    this.expensesService.expenses$,
    this.inventoryService.inventory$,
    this.vehiclesService.vehicleTypes$,
    this.vehiclesService.vehicles$,
    this.incomeService.incomes$,
    this.inventoryService.inventoryItemStatus$,
  ]).pipe(
    map(
      ([
        flats,
        floors,
        vendors,
        expenses,
        inventory,
        vehicleTypes,
        vehicles,
        incomes,
        inventoryItemStatus,
      ]) => {
        return [
          this.flatsService.getPage(flats),
          this.floorsService.getPage(floors),
          this.vendorsService.getPage(vendors),
          this.expensesService.getPage(floors, inventory, vendors, expenses),
          this.inventoryService.getPage(floors, inventoryItemStatus, inventory),
          this.vehiclesService.getPage(flats, vehicles, vehicleTypes),
          this.incomeService.getPage(flats, incomes),
        ];
      }
    )
  );

  pages = toSignal<IPage[]>(this.pages$);
  userDetails = toSignal<User | null>(user(this.auth));
  activePage: WritableSignal<IPage | null> = signal<IPage | null>(null);

  constructor() {
    effect(
      () => {
        const pages = this.pages();
        if (pages && pages.length > 0) {
          const activePage =
            pages.find((p) => p.id == localStorage.getItem("activePageId")) ||
            pages[0];
          if (activePage) {
            this.activePage.set({ ...activePage });
            localStorage.setItem("activePageId", activePage.id);
          }
        }
      },
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const page = this.activePage();
        if (page) {
          localStorage.setItem("activePageId", page.id);
        }
      },
      { allowSignalWrites: true }
    );
  }

  async loginByGoogle() {
    const userCredential: UserCredential = await signInWithPopup(
      this.auth,
      new GoogleAuthProvider()
    );
  }

  async logout() {
    await signOut(this.auth);
  }

  addItem(
    addOrEditDialogRef: TemplateRef<any>,
    defaultValues: IDefaultValues,
    isEdit = false
  ) {
    const dialogRef = this.dialog.open(addOrEditDialogRef, {
      data: {
        title: `${isEdit ? "Update" : "Add New"} ${
          this.activePage()?.signlerName
        }`,
        message: `Are you sure! Do you want to delete ${
          this.activePage()?.signlerName
        }?`,
        isEdit: isEdit,
        formConfig: this.activePage()?.formConfig,
        defaultValues: defaultValues,
        yesClick: async (newForm: NgForm, addNew = true) => {
          if (isEdit) {
            if (
              newForm.valid &&
              newForm.value.name.trim().length > 0 &&
              this.activePage()
            ) {
              const page = this.activePage();
              if (page) {
                page.db?.update(newForm.value, defaultValues.id as string);
                newForm.resetForm({});
                dialogRef.close();
              }
            }
          } else {
            if (newForm.valid && newForm.value.name.trim().length > 0) {
              const page = this.activePage();
              if (page) {
                await page.db?.add(newForm.value);
                newForm.resetForm({});
                if (!addNew) {
                  dialogRef.close();
                }
              }
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
        message: `Are you sure! Do you want to delete ${
          this.activePage()?.signlerName
        }?`,
        yesClick: () => {
          dialogRef.close();
          const page = this.activePage();
          if (page) {
            page.db?.remove(item.id as string);
          }
        },
      },
    });
  }
}
