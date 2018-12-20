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
      map(param => `books/${param.get('id')}`)
    );

    this.bookForm = this.fb.group({
      isbn: [null, []],
      title: [null, [Validators.required]],
      subtitle: [null, []],
      authors: this.fb.array([], []),
      publishedDate: [null, []],
      description: [null, []],
      language: [null, []],
      pageCount: [null, [Validators.min(0)]],
      printType: [null, [Validators.required]],
      thumbnail: [null, []],
      copies: [null, [Validators.required, Validators.min(0)]],
      note: [null, []]
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
