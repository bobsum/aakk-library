import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, switchMap, tap, map, last } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Book } from '../models/book';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() bookRef: AngularFirestoreDocument<Book>;

  isHovering: boolean;
  percentage: Observable<number>;
  book: Observable<Book>;

  constructor(private storage: AngularFireStorage) { }

  ngOnInit() {
    this.book = this.bookRef.valueChanges();
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  startUpload(event: FileList) {
    const file = event.item(0);

    if (file.type.split('/')[0] !== 'image') { // todo take as input
      console.error('unsupported file type :( ');
      return;
    }

    console.log(this.bookRef.ref.path); // todo use this path when save file;

    /*const task = this.storage.upload(this.path, file);
    this.percentage = task.percentageChanges();*/

    // todo update book image with download url
  }
}
