import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IAllCollection, IFormConfig, IItem, IPageService } from "src/app/interfaces";
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
export class FloorsService extends FirestoreBase<IItem> implements IPageService {
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);

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
      floors,
      FORM_FIELDS,
      INITIAL_FORM_VALUES,
      (item) => `
        <i class="fa-solid fa-layer-group me-1 text-danger"></i> ${item.name}
      `,
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: DIALOG_CONFIG.DELETE_ICON,
            name: DIALOG_CONFIG.DELETE_NAME,
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => {
              const data: IConfirmationData = {
                title: DIALOG_CONFIG.DELETE_TITLE,
                message: `${DIALOG_CONFIG.DELETE_MESSAGE_PREFIX}${item.name}${DIALOG_CONFIG.DELETE_MESSAGE_SUFFIX}`,
                yesLabel: DIALOG_CONFIG.YES_LABEL,
                noLabel: DIALOG_CONFIG.NO_LABEL,
                notButtonClick: (): void => dialogRef.close(),
                yesButtonClick: (): void => {
                  this.remove(item.id || "");
                  dialogRef.close();
                  this.snackBar.open(
                    `${item.name}${DIALOG_CONFIG.DELETE_SUCCESS_MESSAGE}`,
                    DIALOG_CONFIG.OK_LABEL
                  );
                },
              };
              const dialogRef: MatDialogRef<ConfirmationDialogComponent> =
                this.dialog.open(ConfirmationDialogComponent, { data });
            },
          },
          {
            icon: DIALOG_CONFIG.EDIT_ICON,
            name: DIALOG_CONFIG.EDIT_NAME,
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => {
              const data: IAddOrEditDialogData = {
                title: `${DIALOG_CONFIG.UPDATE_TITLE_PREFIX}${ENTITY_NAME}`,
                message: DIALOG_CONFIG.EMPTY_MESSAGE,
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
              const dialogRef: MatDialogRef<AddOrEditDialogComponent> =
                this.dialog.open(AddOrEditDialogComponent, { data });
            },
          },
        ],
      },
      (): void => {
        const data: IAddOrEditDialogData = {
          title: `${DIALOG_CONFIG.ADD_TITLE_PREFIX}${ENTITY_NAME}`,
          message: DIALOG_CONFIG.EMPTY_MESSAGE,
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
        const dialogRef: MatDialogRef<AddOrEditDialogComponent> =
          this.dialog.open(AddOrEditDialogComponent, { data });
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

// constants.ts
export const COLLECTION_NAME = "floors";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Floor";
export const ENTITY_PLURAL_NAME = "Floors";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "New Floor Name",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = { name: "" };

export const DIALOG_CONFIG = {
  DELETE_ICON: "delete",
  DELETE_NAME: "Delete",
  DELETE_TITLE: "Delete Confirmation",
  DELETE_MESSAGE_PREFIX: "Are you sure! Do you want to Delete ",
  DELETE_MESSAGE_SUFFIX: "?",
  YES_LABEL: "Yes",
  NO_LABEL: "No",
  DELETE_SUCCESS_MESSAGE: " deleted successfully ",
  OK_LABEL: "OK",
  EDIT_ICON: "edit",
  EDIT_NAME: "Edit",
  UPDATE_TITLE_PREFIX: "Update ",
  ADD_TITLE_PREFIX: "Add ",
  EMPTY_MESSAGE: "",
};
