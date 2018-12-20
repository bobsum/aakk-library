import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { GoogleBooksApiService } from '../google-books-api.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-book-search-dialog',
  templateUrl: './book-search-dialog.component.html',
  styleUrls: ['./book-search-dialog.component.scss']
})
export class BookSearchDialogComponent implements OnInit {

  bookForm: FormGroup;

  constructor(
    private ba: GoogleBooksApiService,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BookSearchDialogComponent>) {}

  ngOnInit() {
    this.bookForm = this.fb.group({ isbn: ['', [Validators.pattern(/\w{13}/g)]]});
  }

  search() {
    this.ba.getBooks(this.bookForm.get('isbn').valueChanges.value);
  }
}
