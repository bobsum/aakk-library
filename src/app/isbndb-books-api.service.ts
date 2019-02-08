import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './models/book';
import { Books, Book as IsbnBook } from './isbndb-books-api.models';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IsbnDbBooksApiService {

  constructor(private http: HttpClient) {}

  getBooks(isbn: string): Observable<Book[]> {
    const url = `https://api.isbndb.com/book/${isbn}`;

    return this.http.get<Books>(url, { headers: { 'X-API-KEY': environment.isbndbApikey } })
      .pipe(
        map(bs => bs.book ? [this.map2book(bs.book, isbn)] : []),
        catchError(() => of([])),
      );
  }

  private map2book(book: IsbnBook, isbn: string): Book {
    const { title, authors, date_published, synopsys, language, pages, image} = book;
    return {
      isbn: isbn || null,
      title: title || null,
      subtitle: null,
      authors: authors || [],
      publishedDate: date_published || null,
      description: synopsys || null,
      language: language || null,
      pageCount: pages || 0,
      printType: 'BOOK',
      imageUrl: null
    };
  }
}
