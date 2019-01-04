import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.afAuth.user.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          console.log('access denied');
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
