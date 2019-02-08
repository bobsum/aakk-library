export class Book {
  isbn: string;
  title: string;
  subtitle: string;
  authors: string[];
  publishedDate: string;
  description: string;
  language: string;
  pageCount: number;
  printType: string;
  imageUrl: string;
  copies?: number;
  note?: string;
  thumbnails?: {
    avatar: string;
    cover: string;
  };
}
