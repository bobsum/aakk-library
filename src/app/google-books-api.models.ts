
export class Volumes {
  kind: string;
  totalItems: number;
  items?: Volume[];
}

export class Volume {
  volumeInfo: VolumeInfo;
}

export class VolumeInfo {
  title: string;
  subtitle: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  pageCount: number;
  printType: string;
  imageLinks: ImageLinks;
  language: string;
}

export class ImageLinks {
  smallThumbnail: string;
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
}
