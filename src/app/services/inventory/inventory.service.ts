import { inject, Injectable } from "@angular/core";
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
import { Observable, of } from "rxjs";
import { getPage, IInventoryItem, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class InventoryService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(this.firestore, "inventoryItem");
  queryRef = query(this.collection, orderBy("name"));
  // prettier-ignore
  inventory$: Observable<IInventoryItem[]> = collectionData<IInventoryItem>( this.queryRef as Query<IInventoryItem, DocumentData>, { idField: "id" } );

  async add(value: IInventoryItem) {
    delete value.id;
    await addDoc(this.collection, value);
  }

  async update(value: IInventoryItem, id: string) {
    delete value.id;
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await updateDoc(docRef, { ...value });
  }

  async remove(id: string) {
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await deleteDoc(docRef);
  }

  async get(id: string) {
    const docRef = doc(this.firestore, `${this.collection.path}/${id}`);
    await getDoc(docRef);
  }

  inventoryItemStatus$: Observable<IItem[]> = of([
    { name: "Working", id: "Working" },
    { name: "Not Working", id: "Not Working" },
  ]);

  constructor() {}
  getPage(
    floors: IItem[],
    inventoryItemStatus: IItem[],
    inventory: IInventoryItem[]
  ) {
    return getPage(
      "Inventory Item",
      "inventory",
      "Inventory",
      inventory,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Inventory Item Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "floor",
          name: "floor",
          defaultValue: "",
          dataProvider: () => floors,
          label: "Item Related Floor",
          required: true,
        },
        {
          type: "dropdown",
          id: "status",
          name: "status",
          defaultValue: "",
          dataProvider: () => inventoryItemStatus,
          label: "Item Status",
          required: true,
        },
        {
          type: "number",
          id: "cost",
          name: "cost",
          defaultValue: null,
          dataProvider: () => [],
          label: "Item Cost Rupees",
          required: true,
        },
      ],
      {
        name: "",
        floor: "",
        status: "",
        cost: null,
      },
      (item: IInventoryItem): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-2 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ floors.find((f) => f.id == item.floor)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${ inventoryItemStatus.find((f) => f.id == item.status)?.name }</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${new Intl.NumberFormat( "en-IN" ).format(item.cost || 0)} ₹</div>`;
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
