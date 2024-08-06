import { inject, Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  getItemNameById,
  getPage,
  IFormConfig,
  IIncome,
  IItem,
  IPayment,
} from "src/app/interfaces";
import { FirestoreBase } from "../firestore-base";
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  Query,
  query,
  where,
  writeBatch,
  WriteBatch,
} from "@angular/fire/firestore";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import { FlatsService } from "../flats/flats.service";
import moment from "moment";

// constants.ts
export const COLLECTION_NAME = "payments";
export const ID_FIELD: keyof IItem = "id";
export const ORDER_BY_FIELD: keyof IItem = "name";
export const ENTITY_NAME = "Payment";
export const ENTITY_PLURAL_NAME = "Payments";
export const FORM_FIELDS: IFormConfig[] = [
  {
    type: "text",
    id: "name",
    name: "name",
    defaultValue: "",
    dataProvider: () => [],
    label: "New Flat Name",
    required: true,
  },
];
export const INITIAL_FORM_VALUES = {
  flatId: "",
  incomeId: "",
  paid: false,
  paymentDate: "",
  name: "",
};

@Injectable({
  providedIn: "root",
})
export class PaymentsService extends FirestoreBase<IPayment> {
  readonly flatsService = inject(FlatsService);
  constructor() {
    super({
      collectionName: COLLECTION_NAME,
      orderByField: ORDER_BY_FIELD,
      idField: ID_FIELD,
    });
    this.items$ = combineLatest([
      this.selectedMonth$.pipe(
        switchMap((selectedMonth) => {
          return this.getMaintenanceByDate(selectedMonth).pipe(
            switchMap(([maintenancesRef]) => {
              if (maintenancesRef) {
                return this.getPaymentsBYMaintenanceId(
                  maintenancesRef.id || ""
                ).pipe(
                  map((payments) => {
                    return { maintenancesRef, payments };
                  })
                );
              } else {
                return of({ maintenancesRef: null, payments: [] });
              }
            })
          );
        })
      ),
      this.flatsService.items$,
    ]).pipe(
      map(([{ maintenancesRef, payments }, flats]) => {
        if (maintenancesRef) {
          return flats.map((flat) => {
            const payment: IPayment = {
              flatId: flat.id || "",
              paid: payments.map((p: any) => p.flatId).includes(flat.id),
              amount: maintenancesRef.amount,
              month: maintenancesRef.month,
              id:
                payments.find((p: any) => p.flatId == flat.id)?.id ||
                `${flat.id}---${maintenancesRef.id}`,
              paymentDate: "",
              maintenanceId: maintenancesRef.id || "",
              name: "",
            };
            return payment;
          });
        }
        return [];
      })
    );
  }

  selectedMonth: BehaviorSubject<string> = new BehaviorSubject("");
  selectedMonth$ = this.selectedMonth.asObservable();

  getMaintenanceByDate(month: string) {
    const collectionRef = collection(this.firestore, `maintenances`); // as CollectionReference<IIncome>;
    const queryRef = query(
      collectionRef,
      where("month", "==", moment(month, "YYYY-MM").format("YYYY-MM"))
    ) as Query<IIncome>;
    const items$ = collectionData<IIncome>(queryRef, { idField: "id" });
    return items$;
  }

  getPaymentsBYMaintenanceId(maintenanceId: string) {
    const collectionRef = collection(this.firestore, `payments`); // as CollectionReference<IIncome>;
    const queryRef = query(
      collectionRef,
      where("maintenanceId", "==", maintenanceId)
    ) as Query<IIncome>;
    const items$ = collectionData<IIncome>(queryRef, { idField: "id" });
    return items$;
  }

  getPage(payments: IPayment[], incomes: IIncome[], flats: IItem[]) {
    return getPage(
      ENTITY_NAME,
      COLLECTION_NAME,
      ENTITY_PLURAL_NAME,
      payments,
      [
        {
          type: "text",
          id: "name",
          name: "name",
          defaultValue: "",
          dataProvider: () => [],
          label: "Payment Name",
          required: false,
        },
        {
          type: "dropdown",
          id: "income",
          name: "income",
          defaultValue: "",
          dataProvider: () => incomes,
          label: "Selecte Income",
          required: true,
        },
        {
          type: "dropdown",
          id: "flat",
          name: "flat",
          defaultValue: "",
          dataProvider: () => flats,
          label: "Select Flat",
          required: true,
        },
        {
          type: "date",
          id: "paymentDate",
          name: "paymentDate",
          defaultValue: null,
          dataProvider: () => [],
          label: "Selecte Payment Date",
          required: true,
        },
      ],
      INITIAL_FORM_VALUES,
      (item: IPayment) => {
        return `
          <div class="position-relative">
            <div class="row">
              <div class="col-12">${getItemNameById(
                flats,
                item.flatId
              )} ${moment(item.month, "YYYY-MM").format("YYYY-MMMM")}</div>
              <div class="col-12">${
                item.paid
                  ? '<span class="badge rounded-pill text-bg-success fw-normal">Paid</span>'
                  : '<span class="badge rounded-pill text-bg-danger fw-normal">Not Paid</span>'
              } 
              <span class="badge rounded-pill text-bg-warning fw-normal">Paid on : N/A</span>
              </div>
            </div>
            <span class="position-absolute top-0 end-0 me-4 mt-3 d-inline-block text-success">${new Intl.NumberFormat(
              "en-IN"
            ).format(item.amount || 0)} ₹</span>
          </div>
        `;
        // return `<pre>${JSON.stringify(item, null, 2)}</pre>`;
      },
      (form: NgForm, valueChanged: string): void => {},
      {
        showDeleteMenu: false,
        showEditMenu: false,
        otherMenus: [
          {
            icon: "thumb_up",
            name: "Mark as Paid",
            disabled: (item: any) => !!item.paid,
            callBack: (item: any): void => {
              delete item.name;
              delete item.id;
              delete item.month;
              delete item.paymentDate;
              item.paid = true;
              console.log(item);
              this.add(item);
            },
          },
          {
            disabled: (item: any) => !item.paid,
            icon: "thumb_down",
            name: "Mark as Not Paid",
            callBack: (item: IItem): void => {
              this.remove(item.id || "");
            },
          },
        ],
      },
      {
        add: this.add.bind(this),
        update: this.update.bind(this),
        remove: this.remove.bind(this),
        get: this.get.bind(this),
      },
      true
    );
  }

  async bulkAdd(maintenanceId: string, item: IIncome) {
    debugger;
    const batch: WriteBatch = writeBatch(this.firestore);
    item.flats.forEach((flat) => {
      if (flat) {
        const payment: IPayment = {
          flatId: flat,
          amount: 0,
          month: "",
          paid: false,
          paymentDate: item.month,
          name: item.month + " Maintenance",
          maintenanceId: "",
        };
        batch.set(
          doc(this.firestore, COLLECTION_NAME, flat + payment.paymentDate),
          payment
        );
        /* const docRef = doc(collection(this.firestore, COLLECTION_NAME));
        batch.set(docRef, payment);
        console.log(payment); */
      }
    });
    await batch.commit();
    // await addDoc(this.collection, itemWithoutId as Omit<T, "id">);
  }
}
