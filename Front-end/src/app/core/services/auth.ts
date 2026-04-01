import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AuthResponse, User } from '../../models/users.model';
import { RefreshResponse } from '../../models/refreshResponse.model';
import { tap } from 'rxjs';
import { login, register } from '../../models/users.model';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  private readonly TOKEN_KEY = 'userToken';

  currentUser = signal<User | null>(null);

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRoleFromToken(): User['role'] | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload?.role;
      return role === 'admin' || role === 'user' ? role : null;
    } catch {
      return null;
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  logout(): void {
    this.clearToken();
    this.currentUser.set(null);
  }

  login(credentials: login) {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((res: AuthResponse) => {
          if (!res?.token) return;
          this.setToken(res.token);

          if (res.user) {
            this.currentUser.set(res.user as User);
          }
        }),
      );
  }
  register(registeredData: register) {
    return this.http.post(`${this.url}/register`, registeredData);
  }

  /**
   * Logs out on the server (deletes refresh session + clears refreshToken cookie)
   * then clears access token locally.
   */
  logoutRequest() {
    return this.http
      .post<{ message: string }>(`${this.url}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.logout();
        }),
      );
  }

  /**
   * Requests a new access token using the refreshToken cookie.
   */
  refreshAccessToken() {
    return this.http
      .post<RefreshResponse>(`${this.url}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res?.accessToken) this.setToken(res.accessToken);
        }),
      );
  }
}
