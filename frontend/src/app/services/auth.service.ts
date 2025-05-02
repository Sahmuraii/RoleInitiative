import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_URL } from '../constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoggedInSubject.next(this.isLoggedIn());
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (this.isBrowser()) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Login failed', error);
        throw error;
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const userData = { username, email, password };
    return this.http.post(`${API_URL}/register`, userData).pipe(
      tap((response: any) => {
        if (this.isBrowser()) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Registration failed', error);
        throw error;
      })
    );
  }

  resetPassword(email: string): Observable<any> {
    const userData = { email };
    return this.http.post(`${API_URL}/forgot-password`, userData).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        console.error('Email failed to send', error);
        throw error;
      })
    );
  }

  resetPasswordConfirm(token: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/reset/${token}`, { password }).pipe(
      tap(() => console.log('Password successfully reset.')),
      catchError((error) => {
        console.error('Failed to reset password', error);
        throw error;
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
      this.isLoggedInSubject.next(false);
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isBrowser() && !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): any {
    if (this.isBrowser()) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  sendConfirmation(): Observable<any> {
    return this.http.get(`${API_URL}/send_confirmation`).pipe(
      tap(() => console.log('Confirmation email sent.')),
      catchError((error) => {
        console.error('Failed to send confirmation email', error);
        throw error;
      })
    );
  }
}
