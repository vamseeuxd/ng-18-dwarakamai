import { inject, Injectable, Inject } from "@angular/core";
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
  DocumentReference,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { IItem } from "src/app/interfaces";
import { FirestoreConfig, FIRESTORE_CONFIG } from "./firestore-config";

@Injectable({
  providedIn: "root",
})
export class FirestoreBase<T extends IItem> {
  firestore: Firestore = inject(Firestore);
  collection: CollectionReference<T>;
  queryRef: Query<T>;
  items$: Observable<T[]>;

  constructor(@Inject(FIRESTORE_CONFIG) private config: FirestoreConfig<T>) {
    this.collection = collection(
      this.firestore,
      config.collectionName
    ) as CollectionReference<T>;
    this.queryRef = query(
      this.collection,
      orderBy(config.orderByField as string)
    ) as Query<T>;
    this.items$ = collectionData<T>(this.queryRef, {
      idField: "id",
    });
  }

  async add(item: T) {
    const { id, ...itemWithoutId } = item;
    await addDoc(this.collection, itemWithoutId as Omit<T, "id">);
  }

  async update(item: T, id: string) {
    const docRef = doc(
      this.firestore,
      `${this.collection.path}/${id}`
    ) as any as DocumentReference<T>;
    await updateDoc(docRef, { ...item as any });
  }

  async remove(id: string) {
    const docRef = doc(
      this.firestore,
      `${this.collection.path}/${id}`
    ) as any as DocumentReference<T>;
    await deleteDoc(docRef);
  }

  async get(id: string) {
    const docRef = doc(
      this.firestore,
      `${this.collection.path}/${id}`
    ) as any as DocumentReference<T>;
    await getDoc(docRef);
  }
}
