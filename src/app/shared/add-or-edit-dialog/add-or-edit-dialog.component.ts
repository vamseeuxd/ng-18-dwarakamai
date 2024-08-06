import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import {
  getItemNameById,
  IDefaultValues,
  IFormConfig,
  IItem,
} from "src/app/interfaces";
import { FormsModule, NgForm } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { CommonModule } from "@angular/common";
import { NgPipesModule } from "ngx-pipes";
import { MatSelect, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";

export interface IAddOrEditDialogData {
  title: string;
  message: string;
  isEdit: boolean;
  formConfig: IFormConfig[] | undefined;
  defaultValues: IDefaultValues;
  yesClick: (newForm: NgForm, addNew?: boolean) => Promise<void>;
  onFormChange: (form: NgForm, valueChanged: string) => void;
}

@Component({
  selector: "app-add-or-edit-dialog",
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    CommonModule,
    NgPipesModule,
    MatSelectModule,
  ],
  templateUrl: "./add-or-edit-dialog.component.html",
  styleUrl: "./add-or-edit-dialog.component.scss",
})
export class AddOrEditDialogComponent {
  getItemNameById = getItemNameById;
  constructor(@Inject(MAT_DIALOG_DATA) public data: IAddOrEditDialogData) {}

  displayFn(items: IItem[]): (value: any) => string {
    return (val: any) => {
      const option = items.find((item) => item.id === val);
      return option ? option.name : "";
    };
  }

  matSelectAll(matSelectRef: MatSelect, isChecked: boolean) {
    const options = matSelectRef.options.toArray();
    if (isChecked) {
      options.forEach((option) => option.select());
    } else {
      options.forEach((option) => option.deselect());
    }
  }
}
