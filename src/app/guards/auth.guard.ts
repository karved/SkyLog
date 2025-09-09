import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      filter(user => user !== undefined), // Wait for auth state to be determined
      take(1),
      map(user => {
        console.log('Auth guard checking user:', user ? 'User exists' : 'No user');
        if (user) {
          return true;
        } else {
          console.log('No user found, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
