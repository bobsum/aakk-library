import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookEditComponent } from './book-edit/book-edit.component';

const routes: Routes = [
  // { path: '', component: HomeComponent },
  {
    path: 'books',
    component: BooksComponent
    /*children: [
      { path: ':id', component: BookEditComponent },
    ]*/
  },
  {
    path: 'books/:id/edit',
    component: BookEditComponent
  },
  { path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
