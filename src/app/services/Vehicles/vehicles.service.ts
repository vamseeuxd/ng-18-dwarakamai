import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IAllCollection, IFormConfig, IItem, IPageService, IVehicle } from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
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
export class VehiclesService extends FirestoreBase<IVehicle> implements IPageService {
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
    const formConfigWithProviders = FORM_CONFIG.map((config) => {
      if (config.type === "dropdown") {
        return { ...config, dataProvider: () => config.dataProvider === FORM_CONFIG[3].dataProvider ? flats : vehicleTypes };
      }
      return config;
    }) as unknown as IFormConfig[];

    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      vehicles,
      formConfigWithProviders,
      INITIAL_FORM_VALUES,
      (item: IVehicle): string => {
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${item.color} color</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${item.make}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${flats.find((f) => f.id == item.flat)?.name}</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${vehicleTypes.find((v) => v.id == item.type)?.name}</div>`;
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
                title: "Delete Confirmation",
                message: `Are you sure! Do you want to Delete ${item.name}?`,
                yesLabel: "Yes",
                noLabel: "No",
                notButtonClick: (): void => {
                  dialogRef.close();
                },
                yesButtonClick: (): void => {
                  this.remove(item.id || "");
                  dialogRef.close();
                  this.snackBar.open(`${item.name} deleted successfully`, "OK");
                },
              };
              dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
            },
          },
          {
            icon: "edit",
            name: "Edit",
            disabled: (item: any): boolean => false,
            callBack: (item: IItem): void => {
              let dialogRef: MatDialogRef<AddOrEditDialogComponent>;
              const data: IAddOrEditDialogData = {
                title: "Update " + ENTITY_NAME,
                message: "",
                isEdit: true,
                formConfig: formConfigWithProviders,
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
          title: "Add " + ENTITY_NAME,
          message: "",
          isEdit: true,
          formConfig: formConfigWithProviders,
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


export const COLLECTION_NAME = "vehicles";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Vehicle";
export const ENTITY_PLURAL_NAME = "Vehicles";
export const INITIAL_FORM_VALUES = {
  name: "",
  color: "",
  make: "",
  flat: "",
  type: "",
};
export const FORM_CONFIG = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vehicle Number",
    required: true,
  },
  {
    type: "text",
    id: "color",
    name: "color",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vehicle Color",
    required: true,
  },
  {
    type: "text",
    id: "make",
    name: "make",
    defaultValue: "",
    dataProvider: () => [],
    label: "Vehicle Make",
    required: true,
  },
  {
    type: "dropdown",
    id: "flat",
    name: "flat",
    defaultValue: "",
    dataProvider: (flats: IItem[]) => flats,
    label: "Vehicle Related Flat",
    required: true,
  },
  {
    type: "dropdown",
    id: "type",
    name: "type",
    defaultValue: "",
    dataProvider: (vehicleTypes: IItem[]) => vehicleTypes,
    label: "Vehicle Type",
    required: true,
  },
];
