// firestore-config.ts
import { InjectionToken } from "@angular/core";

export interface FirestoreConfig<T> {
  collectionName: string;
  orderByField: keyof T;
  idField: keyof T;
}

export const FIRESTORE_CONFIG = new InjectionToken<FirestoreConfig<any>>('FirestoreConfig');
