import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap, take, switchMap, map } from 'rxjs/operators';
import { Book } from '../models/book';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.scss']
})
export class BookEditComponent implements OnInit, OnDestroy {
  bookForm: FormGroup;
  @Input() path: string;

  private _state: 'loading' | 'synced' | 'modified' | 'error';

  @Output() stateChange = new EventEmitter<string>();

  private bookRef: AngularFirestoreDocument<Book>;

  private formSub: Subscription;
  private pathSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private afs: AngularFirestore) { }

  ngOnInit() {
    this.bookForm = this.fb.group({
      isbn: [null, [Validators.pattern(/\w{10}|\w{13}/g)]],
      title: [null, [Validators.required]],
      subtitle: [null, []],
      authors: this.fb.array([], []),
      publishedDate: [null, []],
      description: [null, []],
      language: [null, []],
      pageCount: [null, [Validators.min(0)]],
      printType: [null, [Validators.required]],
      image: [null, []],
      note: [null, []]
    });

    this.preloadBook();
    this.formSub = this.bookForm.valueChanges
      .pipe(
        tap(() => {
          this.state = 'modified';
        })
      )
      .subscribe();
  }

  private preloadBook() {
    this.pathSub = this.route.paramMap.pipe( // todo switch form router to observable path
      map((params: ParamMap) => `books/${params.get('id')}`),
      tap(() => this.state = 'loading'),
      map(path => this.getDocRef(path)),
      tap(ref => this.bookRef = ref),
      switchMap(ref => ref
        .valueChanges()
        .pipe(
          tap(doc => {
            if (doc) {
              this.patchBook(doc);
              this.state = 'synced';
            }
          }),
          take(1)
        )
      )
    ).subscribe();
  }

  get authors() {
    return this.bookForm.get('authors') as FormArray;
  }

  get image() {
    return this.bookForm.get('image').value;
  }

  set image(value) {
    this.bookForm.get('image').setValue(value);
  }

  addAuthor() {
    this.authors.push(this.fb.control('', [Validators.required]));
  }

  deleteAuthor(i: number) {
    this.authors.removeAt(i);
  }

  saveBook() {
    this.setDoc();
  }

  private patchBook(book: Book) {
    const authors = book.authors || [];
    while (this.authors.length !== authors.length) {
      this.authors.length > authors.length ? this.authors.removeAt(0) : this.authors.push(this.fb.control('', [Validators.required]));
    }
    this.bookForm.patchValue(book);
    this.bookForm.markAsPristine();
  }

  private getDocRef(path: string): AngularFirestoreDocument<Book> {
    if (path.split('/').length % 2) {
      return this.afs.doc<Book>(`${path}/${this.afs.createId()}`);
    } else {
      return this.afs.doc<Book>(path);
    }
  }

  private async setDoc() {
    try {
      if (this.bookForm.valid) {
        await this.bookRef.set(this.bookForm.value, { merge: true });
        this.state = 'synced';
      }
    } catch (err) {
      console.error(err);
      this.state = 'error';
    }
  }

  // Setter for state changes
  set state(val) {
    this._state = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy() {
    this.formSub.unsubscribe();
    this.pathSub.unsubscribe();
  }
}
