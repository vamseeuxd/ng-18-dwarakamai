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
import { getItemNameById, getPage, IIncome, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class IncomeService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(this.firestore, "income");
  queryRef = query(this.collection, orderBy("name"));
  // prettier-ignore
  incomes$: Observable<IIncome[]> = collectionData<IIncome>( this.queryRef as Query<IIncome, DocumentData>, { idField: "id" } );

  async add(value: IIncome) {
    delete value.id;
    await addDoc(this.collection, value);
  }

  async update(value: IIncome, id: string) {
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
  oldincomes$: Observable<IIncome[]> = of([
    {
      id: "December 2024 Montly Maintainence",
      name: "December 2024 Montly Maintainence",
      month: "2024-12",
      flats: [
        "flat_101",
        "flat_102",
        "flat_103",
        "flat_104",
        "flat_201",
        "flat_202",
        "flat_203",
        "flat_204",
        "flat_301",
        "flat_302",
        "flat_303",
        "flat_304",
        "flat_401",
        "flat_402",
        "flat_403",
        "flat_404",
      ],
      amount: 1500,
    },
  ]);
  constructor() {}
  getPage(flats: IItem[], incomes: IIncome[]) {
    return getPage(
      "Income",
      "income",
      "Income",
      incomes,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Income Name",
          required: true,
        },
        {
          type: "month",
          id: "month",
          name: "month",
          defaultValue: "",
          dataProvider: () => [],
          label: "Income Month",
          required: true,
        },
        {
          type: "multi-select",
          id: "flats",
          name: "flats",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Flats to Pay",
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
      ],
      {
        name: "",
        id: "",
        month: "",
        flats: [],
        amount: 0,
      },
      (item: IIncome): string => {
        /* prettier-ignore */
        return `<h6 class="mb-2 pb-3 border-bottom">${item.name}</h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for Flat : ${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Amount for ${ item.flats.length } Flats : ${new Intl.NumberFormat("en-IN").format( item.amount * item.flats.length || 0 )} ₹</div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">Month : ${ item.month }</div>
        <div class="p-2 m-2 border shadow-sm"> <p class="m-0 p-0 border-bottom pb-1 mb-1">Flats Needs to Pay : </p> ${item.flats .map((f) => { return `<div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1">${getItemNameById( flats, f )}</div>`; }) .join("")} </div> `;
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
