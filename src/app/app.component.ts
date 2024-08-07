import {
  Component,
  effect,
  inject,
  OnDestroy,
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
import { MatSelect, MatSelectModule } from "@angular/material/select";
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
import { MaintenanceService } from "./services/maintenance/maintenance.service";
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
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { VehicleTypesService } from "./services/vehicleTypes/vehicle-types.service";
import { PaymentsService } from "./services/Payments/payments.service";
import { DatePickerComponent } from "./shared/date-picker/date-picker.component";
import { AddOrEditDialogComponent } from "./shared/add-or-edit-dialog/add-or-edit-dialog.component";
import { PaymentByService } from "./services/payment-by/payment-by.service";
import { InventoryStatusService } from "./services/inventory-status/inventory-status.service";

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
    AddOrEditDialogComponent,
    CdkDrag,
    DatePickerComponent
],
})
export class AppComponent implements OnDestroy {
  auth: Auth = inject(Auth);
  readonly dialog = inject(MatDialog);
  readonly flatsService = inject(FlatsService);
  readonly floorsService = inject(FloorsService);
  readonly vendorsService = inject(VendorsService);
  readonly expensesService = inject(ExpensesService);
  readonly inventoryService = inject(InventoryService);
  readonly inventoryStatusService = inject(InventoryStatusService);
  readonly vehicleTypesService = inject(VehicleTypesService);
  readonly vehiclesService = inject(VehiclesService);
  readonly maintenanceService = inject(MaintenanceService);
  readonly paymentsService = inject(PaymentsService);
  readonly paymentByService = inject(PaymentByService);
  readonly breakpointObserver = inject(BreakpointObserver);
  getItemNameById = getItemNameById;

  destroyed = new Subject<void>();
  fixedSideMenu: boolean;

  displayNameMap = new Map([
    [Breakpoints.XSmall, false],
    [Breakpoints.Small, false],
    [Breakpoints.Medium, true],
    [Breakpoints.Large, true],
    [Breakpoints.XLarge, true],
  ]);

  pages$: Observable<IPage[]> = combineLatest([
    this.flatsService.items$,
    this.floorsService.items$,
    this.vendorsService.items$,
    this.expensesService.items$,
    this.inventoryService.items$,
    this.vehicleTypesService.items$,
    this.vehiclesService.items$,
    this.maintenanceService.items$,
    this.inventoryStatusService.items$,
    this.paymentsService.items$,
    this.paymentByService.items$,
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
        maintenances,
        inventoryItemStatus,
        payments,
        paymentsBy,
      ]) => {
        return [
          this.flatsService.getPage(flats),
          this.floorsService.getPage(floors),
          this.vendorsService.getPage(vendors),
          this.expensesService.getPage(floors, inventory, vendors, expenses),
          this.inventoryService.getPage(floors, inventoryItemStatus, inventory),
          this.vehicleTypesService.getPage(vehicleTypes),
          this.vehiclesService.getPage(flats, vehicles, vehicleTypes),
          this.maintenanceService.getPage(flats, maintenances),
          this.inventoryStatusService.getPage(inventoryItemStatus),
          this.paymentsService.getPage(payments, maintenances, flats, paymentsBy),
          this.paymentByService.getPage(paymentsBy),
        ];
      }
    )
  );

  pages = toSignal<IPage[]>(this.pages$);
  userDetails = toSignal<User | null>(user(this.auth));
  activePage: WritableSignal<IPage | null> = signal<IPage | null>(null);
  selectedDate = signal<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  );

  constructor() {
    effect(()=>{
      this.paymentsService.selectedMonth.next(this.selectedDate())
    });
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

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe((result) => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.fixedSideMenu = this.displayNameMap.get(query) ?? false;
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
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

}
