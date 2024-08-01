import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Observable, of } from "rxjs";
import { getPage, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class FloorsService {
  floors$: Observable<IItem[]> = of([
    { name: "Floor 1", id: "floor_1" },
    { name: "Floor 2", id: "floor_2" },
    { name: "Floor 3", id: "floor_3" },
    { name: "Floor 4", id: "floor_4" },
    { name: "Ground Floor", id: "Ground Floor" },
    { name: "Building", id: "Building" },
  ]);
  getPage(floors:IItem[]) {
    return getPage(
      "Floor",
      "floors",
      "Floors",
      floors,
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
