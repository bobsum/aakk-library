import { Component, OnInit } from '@angular/core';
import { Book } from '../models/book';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GoogleBooksApiService } from '../google-books-api.service';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-create',
  templateUrl: './book-create.component.html',
  styleUrls: ['./book-create.component.scss']
})
export class BookCreateComponent implements OnInit {
  searchForm: FormGroup;
  books$: Observable<Book[]>;
  serching: boolean;

  constructor(
    private ba: GoogleBooksApiService,
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      isbn: [null, [Validators.pattern(/\w{13}/g)]]
    });

    this.books$ = this.isbn
      .valueChanges
      .pipe(
        debounceTime(300),
        filter(x => !!x && this.isbn.valid),
        tap(() => this.serching = true),
        switchMap(isbn => this.ba.getBooks(isbn)),
        tap(() => this.serching = false)
      );
  }

  get isbn() {
    return this.searchForm.get('isbn');
  }

  async createBook(book: Book) {
    console.log(book);
    const bookId = this.afs.createId();
    await this.afs.doc<Book>(`books/${bookId}`)
      .set(book, { merge: true });

    this.router.navigate(['books', bookId, 'edit']);
  }

  createManually() {
    this.router.navigate(['books', this.afs.createId(), 'edit']);
  }
}
