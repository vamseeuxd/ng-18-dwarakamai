import { inject, Injectable } from "@angular/core";
import { Firestore, CollectionReference, collection, orderBy, collectionData, DocumentData, addDoc, doc, updateDoc, deleteDoc, getDoc, query, Query } from "@angular/fire/firestore";
import { NgForm } from "@angular/forms";
import moment from "moment";
import { Observable, of } from "rxjs";
import { getPage, IExpenses, IInventoryItem, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class ExpensesService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(this.firestore, "expenses");
  queryRef = query(this.collection, orderBy("name"));
  // prettier-ignore
  expenses$: Observable<IExpenses[]> = collectionData<IExpenses>( this.queryRef as Query<IExpenses, DocumentData>, { idField: "id" } );

  async add(value: IExpenses) {
    delete value.id;
    await addDoc(this.collection, value);
  }

  async update(value: IExpenses, id: string) {
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
  
  constructor() {}

  getPage(
    floors: IItem[],
    inventory: IInventoryItem[],
    vendors: IItem[],
    expenses: IExpenses[]
  ) {
    return getPage(
      "Expense",
      "expenses",
      "Expenses",
      expenses,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "New Expense Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "floor",
          name: "floor",
          defaultValue: "",
          dataProvider: () => floors,
          label: "Inventory Item Related Floor",
          required: true,
        },
        {
          type: "dropdown",
          id: "inventoryItem",
          name: "inventoryItem",
          defaultValue: "",
          dataProvider: (form: NgForm) => {
            return inventory.filter((i) => i.floor == form.value.floor);
          },
          label: "Inventory Item",
          required: true,
        },
        {
          type: "number",
          id: "amount",
          name: "amount",
          defaultValue: null,
          dataProvider: () => [],
          label: "Amount in ₹",
          required: true,
        },
        {
          type: "dropdown",
          id: "vendor",
          name: "vendor",
          defaultValue: "",
          dataProvider: () => vendors,
          label: "Vendor",
          required: true,
        },
        {
          type: "date",
          id: "startDate",
          name: "startDate",
          defaultValue: "",
          dataProvider: () => [],
          label: "Start Date",
          required: true,
        },
        {
          type: "date",
          id: "settledDate",
          name: "settledDate",
          defaultValue: "",
          dataProvider: () => [],
          label: "Settled Date",
          required: true,
        },
      ],
      {
        name: "",
        floor: "",
        inventoryItem: "",
        amount: "",
        vendor: "",
      },
      (item: IExpenses): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-3 border-bottom">${item.name}</h6>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount : ${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Inventory Item : ${ inventory.find((f) => f.id == item.inventoryItem)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Floor : ${ floors.find((f) => f.id == item.floor)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Vendor : ${ vendors.find((f) => f.id == item.vendor)?.name }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Start Date : ${ moment(item.startDate).format('DD-MMMM-yyyy')  }</div>
                <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Settled Date : ${ moment(item.settledDate).format('DD-MMMM-yyyy') }</div>
                `;
      },
      (form: NgForm, valueChanged: string): void => {
        if (valueChanged === "floor") {
          form.controls.inventoryItem.setValue("");
        }
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
