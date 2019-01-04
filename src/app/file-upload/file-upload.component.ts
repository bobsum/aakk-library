import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  percentage: Observable<number>;
  downloadURL: Observable<string>;
  isHovering: boolean;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore) { }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  startUpload(event: FileList) {
    const file = event.item(0);

    if (file.type.split('/')[0] !== 'image') { // todo take as input
      console.error('unsupported file type :( ');
      return;
    }

    const filePath = `book/${new Date().getTime()}_${file.name}`; // todo take as input

    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    this.percentage = task.percentageChanges();

    task.snapshotChanges()
    .pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL()) // todo store downloadURL
    )
    .subscribe();
  }

}
