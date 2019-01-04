import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public afAuth: AngularFireAuth,
    private router: Router) { }

  async logout() {
    await this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }
}
