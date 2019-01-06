export class Books {
  book: Book;
}

export class Book {
  title: string;
  title_long: string;
  isbn: string;
  isbn13: string;
  dewey_decimal: string;
  format: string;
  image: string;
  binding: string;
  publisher: string;
  language: string;
  date_published: string;
  edition: string;
  pages: number;
  dimensions: string;
  overview: string;
  excerpt: string;
  synopsys: string;
  authors: string[];
  subjects: string[];
  reviews: string[];
}
