import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.scss']
})
export class BookEditComponent implements OnInit {
  bookForm: FormGroup;
  state: string;
  path$;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit() {
    this.path$ = this.route.paramMap.pipe(
      map(param => param.get('id')),
      map(id => id !== 'new' ? `books/${id}` : 'books')
    );

    this.bookForm = this.fb.group({
      isbn: ['', []],
      title: ['', [Validators.required]],
      authors: ['', []],
      year: [2000, []],
      language: [null, []],
      pages: [0, [Validators.min(0)]],
      copies: ['', [Validators.required]],
      overview: ['', []],
      category: ['book', [Validators.required]],
      note: ['', []]
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
