import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IDefaultValues } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  AddOrEditDialogComponent,
  IAddOrEditDialogData,
} from "src/app/shared/add-or-edit-dialog/add-or-edit-dialog.component";
import {
  ConfirmationDialogComponent,
  IConfirmationData,
} from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class PaymentByService extends FirestoreBase<IItem> {
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);

  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(items: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      items,
      FORM_FIELDS,
      INITIAL_FORM_VALUES,
      (item) => item.name,
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: "delete",
            name: "Delete",
            disabled: () => false,
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
                    `${DELETE_DIALOG_CONFIG.successMessagePrefix}${item.name}${DELETE_DIALOG_CONFIG.successMessageSuffix}`,
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
            disabled: () => false,
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

export const COLLECTION_NAME = "paymentBy";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Payment By";
export const ENTITY_PLURAL_NAME = "Payments By";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "Payment By Name",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = { name: "" };
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
