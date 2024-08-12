import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IAllCollection,
  IMaintenance,
  IItem,
  IPageService,
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

@Injectable({
  providedIn: "root",
})
export class PaymentsService extends FirestoreBase<IPayment> implements IPageService {
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
    ) as Query<IMaintenance>;
    return collectionData<IMaintenance>(queryRef, { idField: "id" });
  }

  getPaymentsBYMaintenanceId(maintenanceId: string, flatId = "") {
    const collectionRef = collection(this.firestore, `payments`);
    const whereQueries = [where("maintenanceId", "==", maintenanceId)];
    if (flatId) {
      whereQueries.push(where("flatId", "==", flatId));
    }
    const queryRef = query(collectionRef, ...whereQueries) as Query<IMaintenance>;
    return collectionData<IMaintenance>(queryRef, { idField: "id" });
  }

  getPage({flats, floors, vendors, expenses, inventory, vehicleTypes, vehicles, maintenances, inventoryItemStatus, payments, paymentsBy}: IAllCollection) {
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
              this.markAsPaid(item, flats, maintenances, paymentsBy, true),
          },
          {
            disabled: (item: any) => !item.paid,
            icon: "thumb_down",
            name: "Mark as Not Paid",
            callBack: (item: any): void =>
              this.markAsNotPaid(item, flats, maintenances),
          },
        ],
      },
      (): void =>
        this.markAsPaid(INITIAL_FORM_VALUES, flats, maintenances, paymentsBy, true),
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
                ? `<span class="text-success fw-bold"><i class="fa-regular fa-face-smile me-1"></i> Paid on : ${ item.paymentDate ? moment(item.paymentDate, "YYYY-MM-DD").format("DD-MMM-YYYY") : "N/A" }</span>`
                : '<span class="text-danger fw-bold"><i class="fa-regular fa-face-frown me-1"></i>Not Paid</span>'
            }
          </div>
        </div>
        <span class="position-absolute top-0 end-0 me-4 mt-3 d-inline-block text-success fw-bold">${new Intl.NumberFormat(
          "en-IN"
        ).format(item.amount || 0)} ₹</span>
      </div>
    `;
  }

  private markAsNotPaid(item: any, flats: IItem[], incomes: IMaintenance[]) {
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
    const data: IConfirmationData = {
      title: DELETE_DIALOG_CONFIG.title,
      message: `${DELETE_DIALOG_CONFIG.messagePrefix}${getItemNameById(
        flats,
        item.flatId
      )}${DELETE_DIALOG_CONFIG.messageSuffix}`,
      yesLabel: DELETE_DIALOG_CONFIG.yesLabel,
      noLabel: DELETE_DIALOG_CONFIG.noLabel,
      notButtonClick: (): void => {
        dialogRef.close();
      },
      yesButtonClick: (): void => {
        this.remove(item.id || "");
        dialogRef.close();
        this.snackBar.open(
          `${DELETE_DIALOG_CONFIG.successMessagePrefix}${getItemNameById(
            flats,
            item.flatId
          )}${DELETE_DIALOG_CONFIG.successMessageSuffix}`,
          DELETE_DIALOG_CONFIG.okLabel
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
    incomes: IMaintenance[],
    paymentsBy: IItem[],
    isAdd: boolean
  ) {
    let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
    const data: IAddOrEditDialogData = {
      title: isAdd
        ? MARK_PAID_DIALOG_CONFIG.titleAdd
        : MARK_PAID_DIALOG_CONFIG.titleUpdate,
      message: MARK_PAID_DIALOG_CONFIG.message,
      isEdit: MARK_PAID_DIALOG_CONFIG.isEdit,
      formConfig: MARK_PAID_DIALOG_CONFIG.formFields(
        flats,
        incomes,
        item,
        paymentsBy
      ),
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
              await (isAdd
                ? this.add(newForm.value)
                : this.update(newForm.value, item.id));
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

import { IFormConfig } from "src/app/interfaces";

export const COLLECTION_NAME = "payments";
export const ID_FIELD = "id" as const;
export const ORDER_BY_FIELD = "name" as const;
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
export const DELETE_DIALOG_CONFIG = {
  title: "Delete Confirmation",
  messagePrefix: "Are you sure! Do you want to Delete ",
  messageSuffix: "'s payment?",
  yesLabel: "Yes",
  noLabel: "No",
  successMessagePrefix: "Payment for ",
  successMessageSuffix: " deleted successfully ",
  okLabel: "OK",
};
export const MARK_PAID_DIALOG_CONFIG = {
  titleAdd: "Add Payment Details",
  titleUpdate: "Update Payment Details",
  message: "",
  isEdit: false,
  formFields: (
    flats: IItem[],
    incomes: any,
    item: { flatId: string; maintenanceId: any; paymentBy: any; amount: any },
    paymentsBy: any
  ): IFormConfig[] => [
    {
      type: "date",
      id: "paymentDate",
      name: "paymentDate",
      label: "Payment Date",
      required: true,
      defaultValue: moment().format("YYYY-MM-DD"),
      dataProvider: () => [],
    },
    {
      type: "dropdown",
      id: "flatId",
      name: "flatId",
      label: "Flat",
      required: true,
      defaultValue: getItemNameById(flats, item.flatId),
      dataProvider: () => flats,
    },
    {
      type: "dropdown",
      id: "maintenanceId",
      name: "maintenanceId",
      label: "Maintenance Id",
      required: true,
      defaultValue: item.maintenanceId,
      dataProvider: () => incomes,
    },
    {
      type: "dropdown",
      id: "paymentBy",
      name: "paymentBy",
      label: "Payment By",
      required: true,
      defaultValue: item.paymentBy,
      dataProvider: () => paymentsBy,
    },
    {
      type: "text",
      id: "amount",
      name: "amount",
      label: "Amount in ₹",
      required: true,
      defaultValue: item.amount,
      dataProvider: () => [],
    },
  ],
};
