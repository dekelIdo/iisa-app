import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable({
  providedIn: 'root'
})
export class FakeAuthGuard implements CanActivate {
  constructor(private router: Router) {}
  
  canActivate(): boolean {
    const isAuthorized = sessionStorage.getItem(AUTH_CONSTANTS.SESSION_KEY) === 'true';
    if (!isAuthorized) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
