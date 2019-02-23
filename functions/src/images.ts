import * as functions from 'firebase-functions';
import * as uuid from 'uuid/v4';
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
      return null;
    }

    const bucket = admin.storage().bucket();

    const bookId = context.params['bookId'];
    const workingDir = join(tmpdir(), bookId);
    const tmpFilePath = join(workingDir, 'image.jpg');

    await fs.ensureDir(workingDir);

    await download.image({
      url,
      dest: tmpFilePath
    });

    await bucket.upload(tmpFilePath, {
      destination: join('books', bookId, 'image.jpg'),
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid()
        }
      }
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
      return null;
    }
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), bucketDir, 'thumbs');
    const tmpFilePath = join(workingDir, 'image.jpg');

    if (fileName.startsWith('thumb@') || !object.contentType.includes('image')) {
      return null;
    }

    // 1. Ensure thumbnail dir exists
    await fs.ensureDir(workingDir);

    // 2. Download Source File
    const sourceFile = bucket.file(filePath);
    await sourceFile.download({
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
        destination: join(bucketDir, thumbName),
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: uuid()
          }
        }
      });

      const url = await getDownloadUrl(file);

      return { name: size.name, url };
    });

    // 4. Run the upload operations
    const urls = await Promise.all(uploadPromises);

    // 5. Cleanup remove the tmp/thumbs from the filesystem
    await fs.remove(workingDir);

    // 6. Update book

    const image = await getDownloadUrl(sourceFile);

    const thumbnails = urls.reduce((acc, value) => {
      acc[value.name] = value.url
      return acc;
    }, { });

    return admin.firestore().doc(`books/${bookId}`).update({
      image,
      thumbnails
    });
  });

async function getDownloadUrl(file: Storage.File): Promise<string> {
  // based on https://stackoverflow.com/a/43764656
  const [metadata] = await file.getMetadata();

  if (!metadata.metadata) {
    metadata.metadata = { }
  }
  if (!metadata.metadata.firebaseStorageDownloadTokens) {
    metadata.metadata.firebaseStorageDownloadTokens = uuid();
    await file.setMetadata(metadata);
  }

  const [token] = metadata.metadata.firebaseStorageDownloadTokens.split(',');

  return `https://firebasestorage.googleapis.com/v0/b/${metadata.bucket}/o/${encodeURIComponent(metadata.name)}?alt=media&token=${token}`;
}

export const cleanupAfterBook = functions.firestore
  .document("books/{bookId}")
  .onDelete(async (snap, context) => {
    const bookId = context.params['bookId'];

    console.log(`'books/${bookId}' should be deleted`);
    return;
  });

export const convertImage = functions.firestore
  .document("books/{bookId}")
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();

    if (data.convert === previousData.convert || data.convert !== true) return null;

    const bookId = context.params['bookId'];

    const bucket = admin.storage().bucket();

    const file  = bucket.file(join('books', bookId, 'source.jpg' ));

    const [image] = await file.move(join('books', bookId, 'image.jpg' ));

    const url = await getDownloadUrl(image);

    const {source, ...thumbnails} = data.thumbnails;

    return admin.firestore().doc(`books/${bookId}`)
      .update({
        image: url,
        convert: admin.firestore.FieldValue.delete(),
        thumbnails
      });

    /*const thumbs = [
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
      .update({ convert: admin.firestore.FieldValue.delete(), thumbnails });*/
  });
