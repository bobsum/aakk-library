import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Book } from '../models/book';
import { map } from 'rxjs/operators';

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

    const path = this.bookRef.ref.path;

    const task = this.storage.upload(`${path}/image.jpg`, file);
    this.percentage = task.percentageChanges();
  }
}
