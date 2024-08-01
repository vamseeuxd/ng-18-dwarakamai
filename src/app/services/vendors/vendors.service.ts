import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Observable, of } from "rxjs";
import { getPage, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class VendorsService {
  vendors$: Observable<IItem[]> = of([
    { name: "Vendor-1", id: "vendor_1" },
    { name: "Vendor-2", id: "vendor_2" },
    { name: "Vendor-3", id: "vendor_3" },
    { name: "Vendor-4", id: "vendor_4" },
  ]);
  constructor() {}
  getPage(vendors:IItem[]) {
    return getPage(
      "Vendor",
      "vendors",
      "Vendors",
      vendors,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "New Floor Name",
          required: false,
        },
      ],
      { name: "" },
      (item: IItem): string => {
        return item.name;
      },
      (form: NgForm, valueChanged: string): void => {}
    );
  }
}
