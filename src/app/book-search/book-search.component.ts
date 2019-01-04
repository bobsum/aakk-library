import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GoogleBooksApiService } from '../google-books-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Book } from '../models/book';


@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent implements OnInit {
  searchForm: FormGroup;
  books$: Observable<Book[]>;
  @Output() bookSelected = new EventEmitter<Book>();

  constructor(
    private ba: GoogleBooksApiService,
    private fb: FormBuilder) {}

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
    this.bookSelected.next(book);
  }
}
