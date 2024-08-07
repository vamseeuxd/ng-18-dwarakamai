import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IFormConfig, IItem } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AddOrEditDialogComponent, IAddOrEditDialogData } from "src/app/shared/add-or-edit-dialog/add-or-edit-dialog.component";
import { ConfirmationDialogComponent, IConfirmationData } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

// constants.ts
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
            disabled: (item: any): boolean => {
              return false;
            },
            callBack: (item: IItem): void => {
              let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
              const data: IConfirmationData = {
                title: "Delete Confirmation",
                message: `Are you sure! Do you want to Delete ${ENTITY_NAME}?`,
                yesLabel: "Yes",
                noLabel: "No",
                notButtonClick: (): void => {
                  dialogRef.close();
                },
                yesButtonClick: (): void => {
                  this.remove(item.id || "");
                  dialogRef.close();
                  this.snackBar.open(
                    ` ${ENTITY_NAME} deleted successfully `,
                    "OK"
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
            disabled: (item: any): boolean => {
              return false;
            },
            callBack: (item: IItem): void => {
              let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
              const data: IAddOrEditDialogData = {
                title: "Update " + ENTITY_NAME,
                message: "",
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
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}
