import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { GoogleBooksApiService } from '../google-books-api.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { switchMap, tap, debounceTime, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-search-dialog',
  templateUrl: './book-search-dialog.component.html',
  styleUrls: ['./book-search-dialog.component.scss']
})
export class BookSearchDialogComponent implements OnInit {

  searchForm: FormGroup;
  books$: Observable<Book[]>;

  constructor(
    private ba: GoogleBooksApiService,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BookSearchDialogComponent>) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      isbn: [null, [Validators.pattern(/\w{13}/g)]]
    });

    this.books$ = this.isbn
      .valueChanges
      .pipe(
        debounceTime(300),
        filter(x => !!x && this.isbn.valid),
        switchMap(isbn => this.ba.getBooks(isbn))
      );
  }

  get isbn() {
    return this.searchForm.get('isbn');
  }

  selectBook(book: Book) {
    this.dialogRef.close(book);
  }
}
