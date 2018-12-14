import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule, MatIconModule, MatInputModule, MatSelectModule } from '@angular/material';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FireFormDirective } from './fire-form.directive';
import { BooksComponent } from './books/books.component';
import { HomeComponent } from './home/home.component';
import { BookEditComponent } from './book-edit/book-edit.component';
import { StateComponent } from './state/state.component';

@NgModule({
  declarations: [
    AppComponent,
    FireFormDirective,
    BooksComponent,
    HomeComponent,
    BookEditComponent,
    StateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    NoopAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
