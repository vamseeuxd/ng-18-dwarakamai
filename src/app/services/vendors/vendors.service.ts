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
export class VendorsService extends FirestoreBase<IItem> implements IPageService {
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
      vendors,
      FORM_FIELDS,
      INITIAL_FORM_VALUES,
      (item) => `
        <p class="m-0 p-0"><i class="me-1 text-danger fa-solid fa-user-gear"></i> ${item.name}</p>
        <p class="m-0 p-0"><i class="me-1 text-danger fa-solid fa-phone"></i> ${item.mobile}</p>
      `,
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: "delete",
            name: "Delete",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void =>
              this.openDeleteConfirmationDialog(item),
          },
          {
            icon: "edit",
            name: "Edit",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void =>
              this.openAddOrEditDialog(item, UPDATE_DIALOG_TITLE),
          },
        ],
      },
      (): void =>
        this.openAddOrEditDialog(INITIAL_FORM_VALUES, ADD_DIALOG_TITLE),
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }

  private openDeleteConfirmationDialog(item: IItem) {
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
    const data: IConfirmationData = {
      title: DELETE_CONFIRMATION_TITLE,
      message: DELETE_CONFIRMATION_MESSAGE(item.name),
      yesLabel: DELETE_CONFIRMATION_YES_LABEL,
      noLabel: DELETE_CONFIRMATION_NO_LABEL,
      notButtonClick: (): void => dialogRef.close(),
      yesButtonClick: (): void => {
        this.remove(item.id || "");
        dialogRef.close();
        this.snackBar.open(DELETE_SUCCESS_MESSAGE(item.name), "OK");
      },
    };
    dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
  }

  private openAddOrEditDialog(defaultValues: any, title: string) {
    let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
    const data: IAddOrEditDialogData = {
      title,
      message: "",
      isEdit: title.includes("Update"),
      formConfig: FORM_FIELDS,
      defaultValues,
      yesClick: async (newForm: NgForm, addNew?: boolean) => {
        if (!addNew) {
          if (newForm.valid && newForm.value.name.trim().length > 0) {
            if (title.includes("Update")) {
              this.update(newForm.value, defaultValues.id || "");
            } else {
              this.add(newForm.value);
            }
            newForm.resetForm({});
            dialogRef.close();
          }
        }
      },
      onFormChange: (form: NgForm, valueChanged: string): void => {},
    };
    dialogRef = this.dialog.open(AddOrEditDialogComponent, { data });
  }
}

export const COLLECTION_NAME = "vendors";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Vendor";
export const ENTITY_PLURAL_NAME = "Vendors";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vendor Name",
    required: true,
  },
  {
    type: "tel",
    id: "mobile",
    name: "mobile",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vendor Mobile",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = { name: "", mobile: "" };

export const DELETE_CONFIRMATION_TITLE = "Delete Confirmation";
export const DELETE_CONFIRMATION_MESSAGE = (name: string) =>
  `Are you sure! Do you want to Delete ${name}?`;
export const DELETE_SUCCESS_MESSAGE = (name: string) =>
  `${name} deleted successfully`;
export const DELETE_CONFIRMATION_YES_LABEL = "Yes";
export const DELETE_CONFIRMATION_NO_LABEL = "No";

export const ADD_DIALOG_TITLE = "Add Vendor";
export const UPDATE_DIALOG_TITLE = "Update Vendor";
