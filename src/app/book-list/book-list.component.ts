import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  books$;

  constructor(private afs: AngularFirestore) {}

  ngOnInit() {
    this.books$ = this.afs.collection('books', ref => ref.orderBy('title'))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data };
        }))
      );
  }

  deleteBook(bookId: string) {
    this.afs.doc(`books/${bookId}`).delete();
  }
}
