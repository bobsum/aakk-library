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

export const downloadImage = functions.firestore
  .document("books/{bookId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const url = data.imageUrl as string;

    if (!url) {
      console.log('no image url');
      return null;
    }

    const bucket = admin.storage().bucket();

    const bookId = context.params['bookId']
    const workingDir = join(tmpdir(), bookId);
    const tmpFilePath = join(workingDir, 'source.jpg');

    await fs.ensureDir(workingDir);

    await download.image({
      url,
      dest: tmpFilePath
    });

    await bucket.upload(tmpFilePath, {
      destination: join('books', bookId, 'source.jpg')
    });

    return fs.remove(workingDir);
  });

export const generateThumbs = functions.storage
  .object()
  .onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const [root, bookId, fileName] = filePath.split('/');

    if (root !== 'books') {
      return false;
    }
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), bucketDir, 'thumbs');
    const tmpFilePath = join(workingDir, 'source.jpg');

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
      const thumbName = `thumb@${size.name}.jpg`;
      const thumbPath = join(workingDir, thumbName);

      // Resize source image
      await sharp(tmpFilePath)
        .rotate()
        .resize(size.options)
        .toFile(thumbPath);

      // Upload to GCS
      const [file] = await bucket.upload(thumbPath, {
        destination: join(bucketDir, thumbName)
      });

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '01-01-2500',
      });

      return { name: size.name, url };
    });

    // 4. Run the upload operations
    const urls = await Promise.all(uploadPromises);

    // 5. Cleanup remove the tmp/thumbs from the filesystem
    await fs.remove(workingDir);

    // 6. Update book
    const [source] = await bucket.file(join('books', bookId, 'source.jpg'))
    .getSignedUrl({
      action: 'read',
      expires: '01-01-2500',
    })

    const thumbnails = urls.reduce((acc, value) => {
      acc[value.name] = value.url
      return acc;
    }, { source });

    return admin.firestore().doc(`books/${bookId}`).update({ thumbnails });
  });

export const getDownloadUrl = async (file: Storage.File): Promise<string> => {
  const [metadata] = await file.getMetadata();
  const [token] = metadata.metadata.firebaseStorageDownloadTokens.split(',');

  //todo handle if no token https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase

  console.log(metadata.metadata);
  console.log(token);
  return `https://firebasestorage.googleapis.com/v0/b/${metadata.bucket}/o/${encodeURIComponent(metadata.name)}?alt=media&token=${token}`;
}

export const convertImage = functions.firestore
  .document("books/{bookId}")
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();

    if (data.convert === previousData.convert && data.convert !== true) return null;

    const bookId = context.params['bookId']

    const bucket = admin.storage().bucket();

    const thumbs = [
      { name: 'source', path: 'source.jpg' },
      { name: 'avatar', path: 'thumb@avatar.jpg' },
      { name: 'cover', path: 'thumb@cover.jpg' }
    ];

    const urls = await Promise.all(thumbs.map(async thumb => {
      const file  = bucket.file(join('books', bookId, thumb.path));
      const url = await getDownloadUrl(file);

      return { name: thumb.name, url };
    }));

    const thumbnails = urls.reduce((acc, value) => {
      acc[value.name] = value.url
      return acc;
    }, { });

    return admin.firestore().doc(`books/${bookId}`)
      .update({ convert: admin.firestore.FieldValue.delete(), thumbnails });
  });
