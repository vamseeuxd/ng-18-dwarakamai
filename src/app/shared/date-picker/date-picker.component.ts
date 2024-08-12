import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  input,
  model,
  viewChild,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-date-picker",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./date-picker.component.html",
  styleUrl: "./date-picker.component.scss",
})
export class DatePickerComponent {
  chosenYear: number;
  chosenMonth: number;

  isYearOnly = input(false);

  chosenMonthHandler(normalizedMonth: Date, datepicker: MatDatepicker<any>) {
    this.chosenYear = normalizedMonth.getFullYear(); // Extract the year
    this.chosenMonth = normalizedMonth.getMonth() + 1; // Extract the month (0-based index)
    this.selectedDate.set(`${this.chosenYear}-${this.chosenMonth}`);
    datepicker.close();
  }
  
  chosenYearHandler(normalizedMonth: Date, datepicker: MatDatepicker<any>) {
    if(this.isYearOnly()){
      this.chosenYear = normalizedMonth.getFullYear(); // Extract the year
      this.chosenMonth = normalizedMonth.getMonth() + 1; // Extract the month (0-based index)
      this.selectedDate.set(`${this.chosenYear}`);
      datepicker.close();
    }
  }
  picker = viewChild.required<MatDatepicker<any>>("picker");
  selectedDate = model<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  );

  @HostListener("click", [])
  onHostClick() {
    // this.dateInput().nativeElement.showPicker();
    this.picker().open();
  }
}
