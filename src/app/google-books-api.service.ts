import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './models/book';
import { Volumes, VolumeInfo, ImageLinks } from './google-books-api.models';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GoogleBooksApiService {

  constructor(private http: HttpClient) { }

  getBooks(isbn: string): Observable<Book[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    return this.http.get<Volumes>(url)
      .pipe(
        map(vs => {
          if (vs.items) {
            return vs.items.map(v => this.map2book(v.volumeInfo, isbn));
          } else {
            return [];
          }
        })
      );
  }

  private map2book(volumeInfo: VolumeInfo, isbn: string): Book {
    const { title, subtitle, authors, publishedDate, description, language, pageCount, printType, imageLinks} = volumeInfo;
    return {
      isbn, title, subtitle, authors, publishedDate, description, language, pageCount, printType, image: this.map2image(imageLinks)
    };
  }

  private map2image(imageLinks: ImageLinks): string {
    const order = ['extraLarge', 'large', 'medium', 'small', 'thumbnail', 'smallThumbnail' ];
    if (!imageLinks) {
      return null;
    }

    for (const key of order) {
      const image = imageLinks[key];
      if (image) {
        return image;
      }
    }
    return null;
  }
}
