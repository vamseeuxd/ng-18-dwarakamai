import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IFormConfig,
  IIncome,
  IItem,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import { PaymentsService } from "../Payments/payments.service";
import { addDoc, collection } from "@angular/fire/firestore";
import moment from "moment";

// constants.ts
export const COLLECTION_NAME = "maintenances";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Maintenance";
export const ENTITY_PLURAL_NAME = "Maintenances";
export const INITIAL_FORM_VALUES = {
  name: "",
  id: "",
  month: "",
  amount: 0,
};

@Injectable({
  providedIn: "root",
})
export class MaintenanceService extends FirestoreBase<IIncome> {
  readonly paymentsService = inject(PaymentsService);
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
  }

  getPage(flats: IItem[], incomes: IIncome[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      incomes,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Maintenance Name",
          required: true,
        },
        {
          type: "month",
          id: "month",
          name: "month",
          defaultValue: "",
          dataProvider: () => [],
          label: "Maintenance Month",
          required: true,
        },
        /* {
          type: "multi-select",
          id: "flats",
          name: "flats",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Flats to Pay",
          required: true,
        }, */
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
      INITIAL_FORM_VALUES,
      (item: IIncome): string => {
        /* prettier-ignore */
        return `
        <div class="m-0 p-0 pe-4 ">
          <div class="d-flex justify-content-between align-items-center">
            <span> ${ moment(item.month, 'YYYY-MM').format('MMMM-YYYY') } </span>
            <span>
              <small>
              (<span class="text-success"> ${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹ </span>
              <span class="text-secondary">* ${ flats.length } Flats</span>)
              </small>
              <span class="text-success fw-bold">${new Intl.NumberFormat("en-IN").format( item.amount * flats.length || 0 )} ₹</span>
            </span>
          </div>
          <small class="m-0 p-0 text-muted">${item.name}</small>
        </div> `;
      },
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: true,
        showEditMenu: true,
      },
      {
        /* add: async (item: IIncome) => {
          console.log(item);
          const { id, ...itemWithoutId } = item;
          itemWithoutId.flats = itemWithoutId.flats.filter((x) => !!x);
          const collectionRef = collection(this.firestore, COLLECTION_NAME);
          const doc = await addDoc(collectionRef, itemWithoutId);
          console.log(this.collection, doc.id);
          await this.paymentsService.bulkAdd(doc.id, item);
        }, */
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      }
    );
  }
}

/* return `<h6 role="button" class="my-2 d-flex justify-content-between pe-4 align-items-center">
          <span>
            ${ moment(item.month, 'YYYY-MM').format('YYYY-MMMM') } <small>(${item.name})</small>
          </span>
          <span class="text-success fw-bold">${new Intl.NumberFormat( "en-IN" ).format(item.amount || 0)} ₹</span>
        </h6>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1 d-none">
            Amount for ${ flats.length } Flats : <span class="text-success fw-bold">${new Intl.NumberFormat("en-IN").format( item.amount * flats.length || 0 )} ₹</span>
        </div>
        <div class="border fs-7 d-inline-block rounded-pill px-2 me-1 mb-1 d-none">
          Month : ${ moment(item.month, 'YYYY-MM').format('YYYY-MMMM') }
        </div>
        <div class="p-2 m-2 border shadow-sm d-none"> 
          <p class="m-0 p-0 border-bottom pb-1 mb-1">Flats Needs to Pay : </p> 
          <div class="row g-1">
            ${flats.map((f) => { 
              return `
                <div class="col-6 col-md-3 col-lg-2">
                  <div class="border fs-7 w-100 text-center rounded-pill px-2 me-1 mb-1">${f.name}</div>
                </div>
              `; }) .join("")
            }
          </div>
        </div> `; */