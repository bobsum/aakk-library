import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, switchMap, tap, map, last } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() path: string;
  @Input() preview: string;

  isHovering: boolean;
  percentage: Observable<number>;

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

    const task = this.storage.upload(this.path, file);
    this.percentage = task.percentageChanges();
  }
}
