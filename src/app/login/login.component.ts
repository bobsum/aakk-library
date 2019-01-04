import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router) { }

  async login() {
    await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    this.router.navigate(['/']);
  }
}
