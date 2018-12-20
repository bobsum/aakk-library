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
  MatSelectModule
} from '@angular/material';

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
import { BookCardComponent } from './book-card/book-card.component';
import { BookSearchDialogComponent } from './book-search-dialog/book-search-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    FireFormDirective,
    BooksComponent,
    HomeComponent,
    BookEditComponent,
    StateComponent,
    BookCardComponent,
    BookSearchDialogComponent
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
    MatSelectModule,
    NoopAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [BookSearchDialogComponent]
})
export class AppModule { }
