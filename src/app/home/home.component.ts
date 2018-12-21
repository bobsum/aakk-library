import { Component, OnInit, HostListener } from '@angular/core';
import { GoogleBooksApiService } from '../google-books-api.service';
import { Observable, forkJoin } from 'rxjs';
import { Book } from '../book';
import { map, share } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { BookSearchDialogComponent } from '../book-search-dialog/book-search-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  books$: Observable<Book[]>;

  constructor(private ba: GoogleBooksApiService, private dialog: MatDialog) { }

  ngOnInit() {
    this.books$ = forkJoin(
      /*this.ba.getBooks('9780898868425'),
      this.ba.getBooks('9780470876602'),
      this.ba.getBooks('9783000405327'),
      this.ba.getBooks('9788272862120'),*/
    ).pipe(
      map(([a, b, c, d]) => [...a, ...b, ...c, ...d]),
      share()
    );
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(BookSearchDialogComponent, {
      // width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  /*@HostListener('document:keypress', ['$event'])
  onClick(btn: KeyboardEvent) {
    console.log('button', btn);
  }*/


}


/*export class RfidReader {
  buffer = '';
  bufferTimer: number;

  constructor(private callback: (tag: number) => void) { }

  resetBuffer() {
      this.buffer = '';
  }

  resetBufferTimer() {
      if (this.bufferTimer) clearTimeout(this.bufferTimer);
      this.bufferTimer = setTimeout(() => this.resetBuffer(), 50);
  }

  keydown(event: KeyboardEvent) {
      if (event.repeat) return;
      var key = event.key;
      if (/^\w$/.test(key)) {
          this.buffer += key;
          this.resetBufferTimer();
      } else if (key === 'Enter' && this.buffer.length) {
          this.callback(+this.buffer);
          this.resetBuffer();
      }
  }
}*/
