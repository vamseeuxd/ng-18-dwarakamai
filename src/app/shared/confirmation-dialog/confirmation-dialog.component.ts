import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";

export interface IConfirmationData {
  title: string;
  message: string;
  yesLabel: string;
  noLabel: string;
  notButtonClick: () => void;
  yesButtonClick: () => void;
}

@Component({
  selector: "app-confirmation-dialog",
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: "./confirmation-dialog.component.html",
  styleUrl: "./confirmation-dialog.component.scss",
})
export class ConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: IConfirmationData) {}
}
