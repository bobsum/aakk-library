import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BooksComponent } from './books/books.component';
import { BookEditComponent } from './book-edit/book-edit.component';
import { StateComponent } from './state/state.component';
import { BookCardComponent } from './book-card/book-card.component';
import { BookCardSmallComponent } from './book-card-small/book-card-small.component';
import { BookCreateComponent } from './book-create/book-create.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksComponent,
    BookEditComponent,
    StateComponent,
    BookCardComponent,
    BookCardSmallComponent,
    BookCreateComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    NoopAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
