import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
  bookForm: FormGroup;
  state: string;

  constructor(private fb: FormBuilder, private afs: AngularFirestore) { }

  ngOnInit() {
    this.bookForm = this.fb.group({
      isbn: ['', []],
      title: ['', [Validators.required]],
      authors: ['', []],
      year: [null, []],
      language: [null, []],
      pages: [null, []],
      copies: ['', [Validators.required]],
      overview: ['', []],
      category: ['', [Validators.required]],
      note: ['', []],
    });
  }

  changeHandler(e) {
    this.state = e;
  }

  get isbn() {
    return this.bookForm.get('isbn');
  }

  get title() {
    return this.bookForm.get('title');
  }
}
