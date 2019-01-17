import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

admin.initializeApp();

import * as Storage from '@google-cloud/storage';
const gcs = new Storage();

import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as download from 'image-downloader';

export const convertImage = functions.firestore
  .document("books/{bookId}")
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();
    const bucket = admin.storage().bucket();

    const bookId = context.params['bookId']
    const workingDir = join(tmpdir(), bookId);
    const tmpFilePath = join(workingDir, 'source.png');

    if (data.convert === previousData.convert || data.convert !== true) return null;

    const url = data.image as string;

    if (!url) {
      console.log('no url')
      return null;
    }

    await fs.ensureDir(workingDir);

    const { filename } = await download.image({
      url,
      dest: tmpFilePath
    });

    await bucket.upload(tmpFilePath, {
      destination: join('books', bookId, 'source.png')
    });

    await change.after.ref.update({
      convert: false
    });

    return fs.remove(workingDir);
  });


export const generateThumbs = functions.storage
  .object()
  .onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), bucketDir, 'thumbs');
    const tmpFilePath = join(workingDir, 'source.png');

    if (fileName.startsWith('thumb@') || !object.contentType.includes('image')) {
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
    const sizes = [
      { name: 'avatar', options: { height: 40, width: 40 }},
      { name: 'cover', options: { height: 400 }}
    ];

    const uploadPromises = sizes.map(async size => {
      const thumbName = `thumb@${size.name}.png`;
      const thumbPath = join(workingDir, thumbName);

      // Resize source image
      await sharp(tmpFilePath)
        .resize(size.options)
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
