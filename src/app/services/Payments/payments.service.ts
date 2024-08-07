import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IFormConfig,
  IIncome,
  IItem,
  IPayment,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import {
  collection,
  collectionData,
  doc,
  Query,
  query,
  where,
  writeBatch,
  WriteBatch,
} from "@angular/fire/firestore";
import { BehaviorSubject, combineLatest, map, of, switchMap, take } from "rxjs";
import { FlatsService } from "../flats/flats.service";
import moment from "moment";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  AddOrEditDialogComponent,
  IAddOrEditDialogData,
} from "src/app/shared/add-or-edit-dialog/add-or-edit-dialog.component";
import {
  ConfirmationDialogComponent,
  IConfirmationData,
} from "src/app/shared/confirmation-dialog/confirmation-dialog.component";

export const COLLECTION_NAME = "payments";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Payment";
export const ENTITY_PLURAL_NAME = "Payments";
export const INITIAL_FORM_VALUES = {
  flatId: "",
  incomeId: "",
  paid: false,
  paymentDate: "",
  name: "",
};

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

@Injectable({
  providedIn: "root",
})
export class PaymentsService extends FirestoreBase<IPayment> {
  readonly flatsService = inject(FlatsService);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  selectedMonth: BehaviorSubject<string> = new BehaviorSubject("");
  selectedMonth$ = this.selectedMonth.asObservable();

  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
    this.initializeItems();
  }

  private initializeItems() {
    this.items$ = combineLatest([
      this.selectedMonth$.pipe(
        switchMap((selectedMonth) =>
          this.getMaintenanceByDate(selectedMonth).pipe(
            switchMap(([maintenancesRef]) =>
              maintenancesRef
                ? this.getPaymentsBYMaintenanceId(
                    maintenancesRef.id || ""
                  ).pipe(map((payments) => ({ maintenancesRef, payments })))
                : of({ maintenancesRef: null, payments: [] })
            )
          )
        )
      ),
      this.flatsService.items$,
    ]).pipe(
      map(([{ maintenancesRef, payments }, flats]) => {
        console.log(payments);
        return maintenancesRef
          ? flats.map((flat) => ({
              flatId: flat.id || "",
              paid: payments.map((p: any) => p.flatId).includes(flat.id),
              amount: maintenancesRef.amount,
              month: maintenancesRef.month,
              id:
                payments.find((p: any) => p.flatId == flat.id)?.id ||
                `${flat.id}---${maintenancesRef.id}`,
              paymentDate:
                (payments.find((p: any) => p.flatId == flat.id) as any)
                  ?.paymentDate || "",
              maintenanceId: maintenancesRef.id || "",
              name: "",
            }))
          : [];
      })
    );
  }

  getMaintenanceByDate(month: string) {
    const collectionRef = collection(this.firestore, `maintenances`);
    const queryRef = query(
      collectionRef,
      where("month", "==", moment(month, "YYYY-MM").format("YYYY-MM"))
    ) as Query<IIncome>;
    return collectionData<IIncome>(queryRef, { idField: "id" });
  }

  getPaymentsBYMaintenanceId(maintenanceId: string, flatId = "") {
    const collectionRef = collection(this.firestore, `payments`);
    const whereQueries = [where("maintenanceId", "==", maintenanceId)];
    if (flatId) {
      whereQueries.push(where("flatId", "==", flatId));
    }
    const queryRef = query(collectionRef, ...whereQueries) as Query<IIncome>;
    return collectionData<IIncome>(queryRef, { idField: "id" });
  }

  getPage(
    payments: IPayment[],
    incomes: IIncome[],
    flats: IItem[],
    paymentsBy: IItem[]
  ) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      payments,
      FORM_FIELDS,
      INITIAL_FORM_VALUES,
      (item: IPayment) => this.generatePaymentHTML(item, flats),
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: "thumb_up",
            name: "Mark as Paid",
            disabled: (item: any) => !!item.paid,
            callBack: (item: any): void =>
              this.markAsPaid(item, flats, incomes, paymentsBy),
          },
          {
            disabled: (item: any) => !item.paid,
            icon: "thumb_down",
            name: "Mark as Not Paid",
            callBack: (item: any): void =>
              this.markAsNotPaid(item, flats, incomes),
          },
        ],
      },
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      },
      true
    );
  }

  private generatePaymentHTML(item: IPayment, flats: IItem[]): string {
    // return `<pre>${JSON.stringify(item,null,2)}</pre>`
    return `
      <div class="position-relative">
        <div class="row">
          <div class="col-12">${getItemNameById(flats, item.flatId)} ${moment(
      item.month,
      "YYYY-MM"
    ).format("YYYY-MMMM")}</div>
          <div class="col-12">
            ${
              item.paid
                ? '<span class="badge rounded-pill text-bg-success fw-normal">Paid</span>'
                : '<span class="badge rounded-pill text-bg-danger fw-normal">Not Paid</span>'
            }
            <span class="badge rounded-pill text-bg-warning fw-normal">Paid on : ${
              item.paymentDate
                ? moment(item.paymentDate, "YYYY-MM-DD").format("DD-MMM-YYYY")
                : "N/A"
            }</span>
          </div>
        </div>
        <span class="position-absolute top-0 end-0 me-4 mt-3 d-inline-block text-success">${new Intl.NumberFormat(
          "en-IN"
        ).format(item.amount || 0)} ₹</span>
      </div>
    `;
  }

  private markAsNotPaid(item: any, flats: IItem[], incomes: IIncome[]) {
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
    const data: IConfirmationData = {
      title: "Delete Confirmation",
      message: `Are you sure! Do you want to Delete ${getItemNameById(
        flats,
        item.flatId
      )}'s ${getItemNameById(incomes, item.maintenanceId)} payment?`,
      yesLabel: "Yes",
      noLabel: "No",
      notButtonClick: (): void => {
        dialogRef.close();
      },
      yesButtonClick: (): void => {
        this.remove(item.id || "");
        dialogRef.close();
        this.snackBar.open(
          `${getItemNameById(flats, item.flatId)}'s ${getItemNameById(
            incomes,
            item.maintenanceId
          )} payment deleted successfully `,
          "OK"
        );
      },
    };
    dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data,
    });
  }
  private markAsPaid(
    item: any,
    flats: IItem[],
    incomes: IIncome[],
    paymentsBy: IItem[]
  ) {
    let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
    const data: IAddOrEditDialogData = {
      title: "Update Payment Details",
      message: "",
      isEdit: false,
      formConfig: [
        {
          type: "date",
          id: "paymentDate",
          name: "paymentDate",
          label: "Payment Date",
          required: true,
          defaultValue: null,
          dataProvider: (form: NgForm): IItem[] => [],
        },
        {
          type: "dropdown",
          id: "flatId",
          name: "flatId",
          label: "Flat",
          required: true,
          defaultValue: getItemNameById(flats, item.flatId),
          dataProvider: (form: NgForm): IItem[] => flats,
        },
        {
          type: "dropdown",
          id: "maintenanceId",
          name: "maintenanceId",
          label: "Maintenance Id",
          required: true,
          defaultValue: item.maintenanceId,
          dataProvider: (form: NgForm): IItem[] => incomes,
        },
        {
          type: "dropdown",
          id: "paymentBy",
          name: "paymentBy",
          label: "Payment By",
          required: true,
          defaultValue: item.paymentBy,
          dataProvider: (form: NgForm): IItem[] => {
            return paymentsBy;
          },
        },
        {
          type: "text",
          id: "amount",
          name: "amount",
          label: "Amount in ₹",
          required: true,
          defaultValue: item.amount,
          dataProvider: (form: NgForm): IItem[] => [],
        },
      ],
      defaultValues: {
        flatId: item.flatId,
        paymentDate: moment().format("YYYY-MM-DD"),
        maintenanceId: item.maintenanceId,
        amount: item.amount,
        paymentBy: item.paymentBy,
      },
      yesClick: async (newForm: NgForm, addNew?: boolean) => {
        const sub = this.getPaymentsBYMaintenanceId(
          newForm.value.maintenanceId,
          newForm.value.flatId
        )
          .pipe(take(1))
          .subscribe(async (existingPayment) => {
            if (existingPayment.length === 0) {
              await this.add(newForm.value);
              newForm.resetForm({ ...newForm.value, flatId: "" });
              this.snackBar.open(
                `${getItemNameById(
                  flats,
                  item.flatId
                )} Payment Details added for ${getItemNameById(
                  incomes,
                  item.maintenanceId
                )}`,
                "OK"
              );
              sub.unsubscribe();
              if (dialogRef && !addNew) {
                dialogRef.close();
              }
            } else {
              this.snackBar.open(
                `Maintenance charges have been paid by ${getItemNameById(
                  flats,
                  item.flatId
                )}.`,
                "OK"
              );
              sub.unsubscribe();
            }
          });
      },
      onFormChange: async (form: NgForm, valueChanged: string) => {},
    };
    dialogRef = this.dialog.open(AddOrEditDialogComponent, { data });
  }
}
