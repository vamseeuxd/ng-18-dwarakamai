import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { getPage, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class FlatsService {
  flats: IItem[] = [
    { name: "Flat 101", id: "flat_101" },
    { name: "Flat 102", id: "flat_102" },
    { name: "Flat 103", id: "flat_103" },
    { name: "Flat 104", id: "flat_104" },
    { name: "Flat 201", id: "flat_201" },
    { name: "Flat 202", id: "flat_202" },
    { name: "Flat 203", id: "flat_203" },
    { name: "Flat 204", id: "flat_204" },
    { name: "Flat 301", id: "flat_301" },
    { name: "Flat 302", id: "flat_302" },
    { name: "Flat 303", id: "flat_303" },
    { name: "Flat 304", id: "flat_304" },
    { name: "Flat 401", id: "flat_401" },
    { name: "Flat 402", id: "flat_402" },
    { name: "Flat 403", id: "flat_403" },
    { name: "Flat 404", id: "flat_404" },
  ];

  constructor() {}
  getPage() {
    return getPage(
      "Flat",
      "flats",
      "Flats",
      this.flats,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "New Flat Name",
          required: true,
        },
      ],
      { name: "" },
      (item) => item.name,
      (form: NgForm, valueChanged: string): void => {}
    );
  }
}
