import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { GoogleBooksApiService } from '../google-books-api.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { switchMap, tap, debounceTime, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Book } from '../book';

@Component({
  selector: 'app-book-search-dialog',
  templateUrl: './book-search-dialog.component.html',
  styleUrls: ['./book-search-dialog.component.scss']
})
export class BookSearchDialogComponent implements OnInit {

  bookForm: FormGroup;
  books$: Observable<Book[]>;

  constructor(
    private ba: GoogleBooksApiService,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BookSearchDialogComponent>) {}

  ngOnInit() {
    this.bookForm = this.fb.group({
      isbn: [null, [Validators.pattern(/\w{13}/g)]],
      title: [null, [Validators.required]],
      subtitle: [null, []],
      authors: this.fb.array([this.fb.control('', [])], []),
      publishedDate: [null, []],
      description: [null, []],
      language: [null, []],
      pageCount: [null, [Validators.min(0)]],
      printType: [null, [Validators.required]],
      thumbnail: [null, []],
      copies: [null, [Validators.required, Validators.min(0)]],
      note: [null, []]
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
    return this.bookForm.get('isbn');
  }

  get authors() {
    return this.bookForm.get('authors') as FormArray;
  }

  addBook(book: Book) {
    while (this.authors.length !== book.authors.length) {
      this.authors.length > book.authors.length ? this.authors.removeAt(0) : this.authors.push(this.fb.control('', []));
    }
    this.bookForm.patchValue(book);
  }

  addAuthor() {
    this.authors.push(this.fb.control('', []));
  }

  deleteAuthor(i: number) {
    this.authors.removeAt(i);
  }

  saveBook() {

  }
}
