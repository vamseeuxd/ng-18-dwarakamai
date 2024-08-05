import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  model,
  viewChild,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-date-picker",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./date-picker.component.html",
  styleUrl: "./date-picker.component.scss",
})
export class DatePickerComponent {
  dateInput = viewChild.required<ElementRef>("dateInput");
  selectedDate = model<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  );
  @HostListener("click", [])
  onHostClick() {
    this.dateInput().nativeElement.showPicker();
  }
}
