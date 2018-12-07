import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
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
      /*authors: ['', []],
      year: [null, []],
      language: [null, []],
      pages: [null, []],
      copies: ['', [Validators.required]],
      overview: ['', []],
      category: ['', [Validators.required]],
      note: ['', []],*/
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
