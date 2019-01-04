import { Directive, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { tap, take, debounceTime, switchMap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[fireForm]'
})
export class FireFormDirective implements OnInit, OnDestroy {
  @Input() path: Observable<string>;
  @Input() formGroup: FormGroup;

  private _state: 'loading' | 'synced' | 'modified' | 'error';

  @Output() stateChange = new EventEmitter<string>();
  @Output() formError = new EventEmitter<string>();

  private docRef: AngularFirestoreDocument;

  private formSub: Subscription;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.preloadData();
    this.autoSave();
  }

  preloadData() {
    this.path.pipe(
      switchMap(path => {
        this.state = 'loading';
        this.docRef = this.getDocRef(path);
        return this.docRef
          .valueChanges()
          .pipe(
            tap(doc => {
              if (doc) {
                this.formGroup.patchValue(doc);
                this.formGroup.markAsPristine();
              } else {
                this.formGroup.reset();
              }
              this.state = 'synced';
            }),
            take(1)
          );
      })
    ).subscribe();
  }

  autoSave() {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        }),
        debounceTime(2000),
        tap(change => {
          if (this.formGroup.valid && this._state === 'modified') {
            this.setDoc();
          }
        })
      )
      .subscribe();
  }

  @HostListener('ngSubmit', ['$event'])
  onsubmit(e) {
    this.setDoc();
  }

  getDocRef(path: string): any {
    if (path.split('/').length % 2) {
      return this.afs.doc(`${path}/${this.afs.createId()}`);
    } else {
      return this.afs.doc(path);
    }
  }

  async setDoc() {
    try {
      await this.docRef.set(this.formGroup.value, { merge: true });
      this.state = 'synced';
    } catch (err) {
      console.log(err);
      this.formError.emit(err.message);
      this.state = 'error';
    }
  }

  set state(val) {
    this._state = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy() {
    this.formSub.unsubscribe();
  }
}
