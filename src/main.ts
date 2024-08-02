import '@angular/localize/init';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import {
  VERSION as MAT_VERSION,
  MatNativeDateModule,
} from '@angular/material/core';
import { AppComponent } from './app/app.component';

/* eslint-disable no-console */
console.info('Angular CDK version', CDK_VERSION.full);
console.info('Angular Material version', MAT_VERSION.full);

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(MatNativeDateModule),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'dwarakamai-vizag',
        appId: '1:1022370352103:web:44d73af68fb3924780cb42',
        storageBucket: 'dwarakamai-vizag.appspot.com',
        apiKey: 'AIzaSyDJmvEC3NOgEesqDEvASnYL3V59y1T6POk',
        authDomain: 'dwarakamai-vizag.firebaseapp.com',
        messagingSenderId: '1022370352103',
        measurementId: 'G-GDG2Y5CNW0',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
}).catch((err) => console.error(err));
