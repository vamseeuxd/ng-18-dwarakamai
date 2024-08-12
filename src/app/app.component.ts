import {
  Component,
  effect,
  inject,
  OnDestroy,
  signal,
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
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import {
  IPage,
  getItemNameById,
  IAllCollection,
  IUser,
} from "./interfaces";
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
import {
  combineLatest,
  map,
  Observable,
  Subject,
  take,
  takeUntil,
} from "rxjs";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { VehicleTypesService } from "./services/vehicleTypes/vehicle-types.service";
import { PaymentsService } from "./services/Payments/payments.service";
import { DatePickerComponent } from "./shared/date-picker/date-picker.component";
import { AddOrEditDialogComponent } from "./shared/add-or-edit-dialog/add-or-edit-dialog.component";
import { PaymentByService } from "./services/payment-by/payment-by.service";
import { InventoryStatusService } from "./services/inventory-status/inventory-status.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  IConfirmationData,
} from "./shared/confirmation-dialog/confirmation-dialog.component";
import { UsersService } from "./services/users/users.service";
import { DashboardComponent } from "./shared/dashboard/dashboard.component";
import { DashboardService } from "./services/dashboard/dashboard.service";
import moment from "moment";

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
    DashboardComponent,
    AddOrEditDialogComponent,
    CdkDrag,
    DatePickerComponent,
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
  readonly usersService = inject(UsersService);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly dashboardService = inject(DashboardService);
  readonly snackBar = inject(MatSnackBar);
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
    this.usersService.items$,
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
        users,
      ]) => {
        const allCollection: IAllCollection = {
          flats,
          floors,
          vendors,
          expenses,
          inventory,
          vehicleTypes,
          vehicles,
          maintenances: maintenances.sort((a, b) => {
            const monthA: moment.Moment = moment(a.month, "YYYY-MM");
            const monthB: moment.Moment = moment(b.month, "YYYY-MM");
            return monthA.diff(monthB);
          }),
          inventoryItemStatus,
          payments,
          paymentsBy,
          users,
        };

        this.dashboardService.allCollection$.next(allCollection);

        return [
          this.flatsService.getPage(allCollection),
          this.floorsService.getPage(allCollection),
          this.vendorsService.getPage(allCollection),
          this.expensesService.getPage(allCollection),
          this.inventoryService.getPage(allCollection),
          this.vehicleTypesService.getPage(allCollection),
          this.vehiclesService.getPage(allCollection),
          this.maintenanceService.getPage(allCollection),
          this.inventoryStatusService.getPage(allCollection),
          this.paymentsService.getPage(allCollection),
          this.paymentByService.getPage(allCollection),
          this.usersService.getPage(allCollection),
        ];
      }
    )
  );

  isDashboard = signal(true);

  pages = toSignal<IPage[]>(this.pages$);
  userDetails = signal<{
    status:
      | "waiting-for-access"
      | "access-provided"
      | "waiting-for-registration";
    user: User;
    registration: IUser | null;
  } | null>(null);

  activePage: WritableSignal<IPage | null> = signal<IPage | null>(null);
  selectedDate = signal<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  );
  selectedYear = signal<string>(
    `${new Date().getFullYear()}`
  );

  constructor() {
    effect(() => {
      this.paymentsService.selectedMonth.next(this.selectedDate());
    });
    effect(() => {
      this.maintenanceService.selectedYear.next(this.selectedYear());
    });

    user(this.auth).subscribe((userDetails) => {
      if (userDetails && userDetails.email) {
        this.checkAccess(userDetails);
      } else {
        this.userDetails.set(null);
        console.log("Logged Out");
      }
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: "Logout Confirmation",
        message: "Are you sure! Do you want to Logout?",
        yesLabel: "Yes",
        noLabel: "No",
        notButtonClick: (): void => {
          dialogRef.close();
        },
        yesButtonClick: async () => {
          await signOut(this.auth);
          dialogRef.close();
        },
      },
    });
  }

  async register(form: NgForm) {
    await this.usersService.add(form.value);
    form.resetForm({});
    this.snackBar.open(
      "Your registration is complete. Please contact Apartment Management to obtain access.",
      "OK"
    );
    const user = this.userDetails()?.user;
    if (user) {
      this.checkAccess(user);
    }
  }

  unRegister() {
    const data: IConfirmationData = {
      title: "Unregister Confirmation",
      message: `Are you sure! Do you want to Unregister?`,
      yesLabel: "Yes",
      noLabel: "No",
      notButtonClick: (): void => dialogRef.close(),
      yesButtonClick: async (): Promise<void> => {
        const userDetails = this.userDetails();
        if (
          userDetails &&
          userDetails?.registration &&
          userDetails?.registration?.id
        ) {
          await this.usersService.remove(userDetails.registration.id);
          dialogRef.close();
          this.snackBar.open(`Unregistered successfully`, "OK");
          const user = this.userDetails()?.user;
          if (user) {
            this.checkAccess(user);
          }
        }
      },
    };
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> =
      this.dialog.open(ConfirmationDialogComponent, { data });
  }

  checkAccess(userDetails: User) {
    if (userDetails && userDetails.email) {
      const sub2 = this.usersService
        .checkAccess(userDetails.email)
        .pipe(take(1))
        .subscribe((ud) => {
          if (ud && ud.length > 0) {
            if (ud[0].access === "yes") {
              this.userDetails.set({
                status: "access-provided",
                user: userDetails,
                registration: ud[0],
              });
            } else {
              this.userDetails.set({
                status: "waiting-for-access",
                user: userDetails,
                registration: ud[0],
              });
            }
          } else {
            this.userDetails.set({
              status: "waiting-for-registration",
              user: userDetails,
              registration: null,
            });
          }
          console.log(ud);
          sub2.unsubscribe();
        });
    }
  }
}
