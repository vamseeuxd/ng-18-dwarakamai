import { inject, Injectable } from "@angular/core";
import {
  Firestore,
  CollectionReference,
  collection,
  collectionData,
  DocumentData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Query,
  query,
  orderBy,
} from "@angular/fire/firestore";
import { NgForm } from "@angular/forms";
import { Observable, of } from "rxjs";
import { getPage, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class FlatsService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(this.firestore, "flats");
  queryRef = query(this.collection, orderBy("name"));
  // prettier-ignore
  flats$: Observable<IItem[]> = collectionData<IItem>( this.queryRef as Query<IItem, DocumentData>, { idField: "id" } );

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

  getPage(flats: IItem[]) {
    return getPage(
      "Flat",
      "flats",
      "Flats",
      flats,
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
