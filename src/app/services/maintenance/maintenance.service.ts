import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IAllCollection, IIncome, IPageService } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import { PaymentsService } from "../Payments/payments.service";
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
export class MaintenanceService extends FirestoreBase<IIncome> implements IPageService {
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly paymentsService = inject(PaymentsService);

  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage({flats, floors, vendors, expenses, inventory, vehicleTypes, vehicles, maintenances, inventoryItemStatus, payments, paymentsBy}: IAllCollection) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      maintenances,
      FORM_FIELDS,
      INITIAL_FORM_VALUES,
      (item: IIncome): string => {
        return `
        <div class="m-0 p-0 pe-4">
          <div class="d-flex justify-content-between align-items-center">
            <span>${moment(item.month, "YYYY-MM").format("MMMM-YYYY")}</span>
            <span>
              <small>
              (<span class="text-success"> ${new Intl.NumberFormat(
                "en-IN"
              ).format(item.amount || 0)} ₹ </span>
              <span class="text-secondary">* ${flats.length} Flats</span>)
              </small>
              <span class="text-success fw-bold">${new Intl.NumberFormat(
                "en-IN"
              ).format(item.amount * flats.length || 0)} ₹</span>
            </span>
          </div>
          <small class="m-0 p-0 text-muted">${item.name}</small>
        </div>`;
      },
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: "delete",
            name: "Delete",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => {
              let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
              const data: IConfirmationData = {
                title: DELETE_DIALOG_CONFIG.title,
                message: `${DELETE_DIALOG_CONFIG.messagePrefix}${item.name}${DELETE_DIALOG_CONFIG.messageSuffix}`,
                yesLabel: DELETE_DIALOG_CONFIG.yesLabel,
                noLabel: DELETE_DIALOG_CONFIG.noLabel,
                notButtonClick: (): void => dialogRef.close(),
                yesButtonClick: (): void => {
                  this.remove(item.id || "");
                  dialogRef.close();
                  this.snackBar.open(
                    `${item.name}${DELETE_DIALOG_CONFIG.successMessagePrefix}${DELETE_DIALOG_CONFIG.successMessageSuffix}`,
                    DELETE_DIALOG_CONFIG.okLabel
                  );
                },
              };
              dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data,
              });
            },
          },
          {
            icon: "edit",
            name: "Edit",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => {
              let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
              const data: IAddOrEditDialogData = {
                title: `${EDIT_DIALOG_CONFIG.titlePrefix}${ENTITY_NAME}`,
                message: EDIT_DIALOG_CONFIG.emptyMessage,
                isEdit: true,
                formConfig: FORM_FIELDS,
                defaultValues: item as any,
                yesClick: async (newForm: NgForm, addNew?: boolean) => {
                  if (!addNew) {
                    if (newForm.valid && newForm.value.name.trim().length > 0) {
                      this.update(newForm.value, item.id || "");
                      newForm.resetForm({});
                      dialogRef.close();
                    }
                  }
                },
                onFormChange: (form: NgForm, valueChanged: string): void => {},
              };
              dialogRef = this.dialog.open(AddOrEditDialogComponent, { data });
            },
          },
        ],
      },
      (): void => {
        let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
        const data: IAddOrEditDialogData = {
          title: `${ADD_DIALOG_CONFIG.titlePrefix}${ENTITY_NAME}`,
          message: ADD_DIALOG_CONFIG.emptyMessage,
          isEdit: true,
          formConfig: FORM_FIELDS,
          defaultValues: INITIAL_FORM_VALUES,
          yesClick: async (newForm: NgForm, addNew?: boolean) => {
            if (!addNew) {
              if (newForm.valid && newForm.value.name.trim().length > 0) {
                this.add(newForm.value);
                newForm.resetForm({});
                dialogRef.close();
              }
            }
          },
          onFormChange: (form: NgForm, valueChanged: string): void => {},
        };
        dialogRef = this.dialog.open(AddOrEditDialogComponent, { data });
      },
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}

import { IFormConfig, IItem } from "src/app/interfaces";

export const COLLECTION_NAME = "maintenances";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Maintenance";
export const ENTITY_PLURAL_NAME = "Maintenances";
export const INITIAL_FORM_VALUES = {
  name: "",
  id: "",
  month: "",
  amount: 0,
};
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "Maintenance Name",
    required: true,
  },
  {
    type: "month",
    id: "month",
    name: "month",
    defaultValue: "",
    dataProvider: () => [],
    label: "Maintenance Month",
    required: true,
  },
  {
    type: "number",
    id: "amount",
    name: "amount",
    defaultValue: null,
    dataProvider: () => [],
    label: "Amount in ₹",
    required: true,
  },
];

export const DELETE_DIALOG_CONFIG = {
  title: "Delete Confirmation",
  messagePrefix: "Are you sure! Do you want to Delete ",
  messageSuffix: "?",
  yesLabel: "Yes",
  noLabel: "No",
  successMessagePrefix: " ",
  successMessageSuffix: " deleted successfully ",
  okLabel: "OK",
};

export const EDIT_DIALOG_CONFIG = {
  titlePrefix: "Update ",
  emptyMessage: "",
};

export const ADD_DIALOG_CONFIG = {
  titlePrefix: "Add ",
  emptyMessage: "",
};
