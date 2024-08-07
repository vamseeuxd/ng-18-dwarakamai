import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IFormConfig,
  IItem,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  AddOrEditDialogComponent,
  IAddOrEditDialogData,
} from "src/app/shared/add-or-edit-dialog/add-or-edit-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent,
  IConfirmationData,
} from "src/app/shared/confirmation-dialog/confirmation-dialog.component";

// constants.ts
export const COLLECTION_NAME = "flats";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Flat";
export const ENTITY_PLURAL_NAME = "Flats";
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
export const INITIAL_FORM_VALUES = { name: "" };
export const DELETE_CONFIRMATION_TITLE = "Delete Confirmation";
export const DELETE_CONFIRMATION_MESSAGE = `Are you sure! Do you want to Delete ${ENTITY_NAME}?`;
export const DELETE_SUCCESS_MESSAGE = `${ENTITY_NAME} deleted successfully`;
export const ADD_NEW_TITLE = `Add New ${ENTITY_NAME}`;
export const UPDATE_TITLE_PREFIX = `Update `;

@Injectable({
  providedIn: "root",
})
export class FlatsService extends FirestoreBase<IItem> {
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);

  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  private openDialog(
    component: any,
    data: IAddOrEditDialogData | IConfirmationData
  ): MatDialogRef<any> {
    return this.dialog.open(component, { data });
  }

  private handleDelete(item: IItem): void {
    const dialogRef = this.openDialog(ConfirmationDialogComponent, {
      title: DELETE_CONFIRMATION_TITLE,
      message: DELETE_CONFIRMATION_MESSAGE,
      yesLabel: "Yes",
      noLabel: "No",
      notButtonClick: (): void => {
        dialogRef.close();
      },
      yesButtonClick: (): void => {
        this.remove(item.id || "");
        dialogRef.close();
        this.snackBar.open(DELETE_SUCCESS_MESSAGE, "OK");
      },
    });
  }

  private handleEdit(item: IItem): void {
    const dialogRef = this.openDialog(AddOrEditDialogComponent, {
      title: `${UPDATE_TITLE_PREFIX}${ENTITY_NAME}`,
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
    });
  }

  private handleAdd(): void {
    const dialogRef = this.openDialog(AddOrEditDialogComponent, {
      title: ADD_NEW_TITLE,
      message: "",
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
    });
  }

  getPage(flats: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      flats,
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
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => this.handleDelete(item),
          },
          {
            icon: "edit",
            name: "Edit",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => this.handleEdit(item),
          },
        ],
      },
      () => this.handleAdd(),
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}
