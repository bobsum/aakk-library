import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, switchMap, tap, map, last } from 'rxjs/operators';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {

  @Input() image: string;
  @Output() imageChange = new EventEmitter<string>();

  isHovering: boolean;

  constructor(private storage: AngularFireStorage) { }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  startUpload(event: FileList) {
    const file = event.item(0);

    if (file.type.split('/')[0] !== 'image') { // todo take as input
      console.error('unsupported file type :( ');
      return;
    }

    const filePath = `books/${new Date().getTime()}_${file.name}`; // todo take as input

    const task = this.storage.upload(filePath, file);
    // this.percentage = task.percentageChanges();

    task.snapshotChanges()
      .pipe(
        last(),
        switchMap(t => t.ref.getDownloadURL()),
        tap(url => this.imageChange.emit(url as string))
      )
      .subscribe();
  }
}
