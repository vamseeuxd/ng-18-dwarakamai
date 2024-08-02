import { inject, Injectable } from "@angular/core";
import {
  CollectionReference,
  DocumentData,
  Firestore,
  Query,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "@angular/fire/firestore";
import { NgForm } from "@angular/forms";
import { Observable, of } from "rxjs";
import { getPage, IItem } from "src/app/interfaces";

@Injectable({
  providedIn: "root",
})
export class FloorsService {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference = collection(this.firestore, "floors");
  // prettier-ignore
  floors$: Observable<IItem[]> = collectionData<IItem>( this.collection as Query<IItem, DocumentData>, { idField: "id" } );

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

  getPage(floors: IItem[]) {
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
