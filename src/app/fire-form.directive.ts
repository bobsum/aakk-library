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
  @Input() path: string;
  @Input() formGroup: FormGroup;
  @Input() autoSave: boolean;

  private _state: 'loading' | 'synced' | 'modified' | 'error';

  @Output() stateChange = new EventEmitter<string>();
  @Output() formError = new EventEmitter<string>();

  private docRef: AngularFirestoreDocument;

  private formSub: Subscription;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.preloadData();
    this.valueChanges();
  }

  private preloadData() {
    this.state = 'loading';
    this.docRef = this.getDocRef(this.path);
    this.docRef
      .valueChanges()
      .pipe(
        tap(doc => {
          if (doc) {
            this.formGroup.patchValue(doc);
            this.formGroup.markAsPristine();
            this.state = 'synced';
          }
        }),
        take(1)
      ).subscribe();
  }

  private valueChanges() {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(_ => {
          this.state = 'modified';
        }),
        debounceTime(2000),
        tap(_ => {
          if (this.autoSave && this.formGroup.valid && this._state === 'modified') {
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

  private getDocRef(path: string): any {
    if (path.split('/').length % 2) {
      return this.afs.doc(`${path}/${this.afs.createId()}`);
    } else {
      return this.afs.doc(path);
    }
  }

  private async setDoc() {
    try {
      await this.docRef.set(this.formGroup.value, { merge: true });
      this.state = 'synced';
    } catch (err) {
      console.error(err);
      this.formError.emit(err.message);
      this.state = 'error';
    }
  }

  private set state(val) {
    this._state = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy() {
    this.formSub.unsubscribe();
  }
}
