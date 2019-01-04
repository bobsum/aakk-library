import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {
  books$;

  constructor(private afs: AngularFirestore, private router: Router) {}

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
    if (confirm('Are you sure you want to delete the book?')) {
      this.afs.doc(`books/${bookId}`).delete();
    }
  }
}
