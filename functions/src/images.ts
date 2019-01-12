import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

admin.initializeApp();

import * as Storage from '@google-cloud/storage';
const gcs = new Storage();

import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';

export const convertImage = functions.firestore
  .document("books/{bookId}")
  .onUpdate((change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();

    if (data.convert === previousData.convert || data.convert !== true) return null;

    console.log(data.image);
    //data.image
    // http://books.google.com/books/content?id=IXqk_0N1HgcC&printsec=frontcover&img=1&zoom=1&source=gbs_api
    // https://firebasestorage.googleapis.com/v0/b/aakk-library.appspot.com/o/books%2F1546798984445_image.jpg?alt=media&token=01031a91-cccd-425b-9e88-2c908cacc91e

    // Then return a promise of a set operation to update the count
    return change.after.ref.update({
      convert: false
    });
  })


export const generateThumbs = functions.storage
  .object()
  .onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), 'thumbs');
    const tmpFilePath = join(workingDir, 'source.png');

    if (fileName.includes('thumb@') || !object.contentType.includes('image')) {
      console.log('exiting function');
      return false;
    }

    // 1. Ensure thumbnail dir exists
    await fs.ensureDir(workingDir);

    // 2. Download Source File
    await bucket.file(filePath).download({
      destination: tmpFilePath
    });

    // 3. Resize the images and define an array of upload promises
    const sizes = [64, 128, 256];

    const uploadPromises = sizes.map(async size => {
      const thumbName = `thumb@${size}_${fileName}`;
      const thumbPath = join(workingDir, thumbName);

      // Resize source image
      await sharp(tmpFilePath)
        .resize(size, size)
        .toFile(thumbPath);

      // Upload to GCS
      return bucket.upload(thumbPath, {
        destination: join(bucketDir, thumbName)
      });
    });

    // 4. Run the upload operations
    await Promise.all(uploadPromises);

    // 5. Cleanup remove the tmp/thumbs from the filesystem
    return fs.remove(workingDir);
  });
