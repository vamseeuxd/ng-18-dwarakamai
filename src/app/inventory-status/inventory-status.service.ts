import { inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { getPage, IItem } from "../interfaces";
import {
  Firestore,
  CollectionReference,
  collection,
  orderBy,
  collectionData,
  DocumentData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  Query,
} from "@angular/fire/firestore";
import { NgForm } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class InventoryStatusService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(
    this.firestore,
    "inventoryItemStatuses"
  );
  queryRef = query(this.collection, orderBy("name"));
  // prettier-ignore
  inventoryItemStatus$: Observable<IItem[]> = collectionData<IItem>( this.queryRef as Query<IItem, DocumentData>, { idField: "id" } );

  async add(floor: IItem) {
    delete floor.id;
    await addDoc(this.collection, floor);
  }

  async update(floor: IItem, id: string) {
    delete floor.id;
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await updateDoc(docRef, { ...floor });
  }

  async remove(id: string) {
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await deleteDoc(docRef);
  }

  async get(id: string) {
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await getDoc(docRef);
  }
  oldinventoryItemStatus$: Observable<IItem[]> = of([
    { name: "Working", id: "Working" },
    { name: "Not Working", id: "Not Working" },
  ]);
  constructor() {}

  getPage(inventoryItemStatus: IItem[]) {
    return getPage(
      "Inventory Item Status",
      "inventoryItemStatuses",
      "Inventory Item Statuses",
      inventoryItemStatus,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "New Status",
          required: false,
        },
      ],
      { name: "" },
      (item: IItem): string => {
        return item.name;
      },
      (form: NgForm, valueChanged: string): void => {},
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}
