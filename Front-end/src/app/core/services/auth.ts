import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AuthResponse, User, login, register } from '../../models/users.model';
import { RefreshResponse } from '../../models/refreshResponse.model';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  private readonly TOKEN_KEY = 'userToken';
  private readonly USER_KEY = 'currentUser';

  currentUser = signal<User | null>(null);

  constructor() {
    this.restoreSession();
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRoleFromToken(): User['role'] | null {
    const payload = this.decodeJwtPayload();
    const role = payload?.role;
    return role === 'admin' || role === 'user' ? role : null;
  }

  getUserIdFromToken(): string | null {
    const payload = this.decodeJwtPayload();
    return this.extractUserId(payload);
  }

  getCurrentUserId(): string | null {
    const fromCurrentUser = this.extractUserId(this.currentUser());
    if (fromCurrentUser) return fromCurrentUser;
    return this.getUserIdFromToken();
  }

  getCurrentUserName(): string | null {
    return this.currentUser()?.name ?? null;
  }

  private decodeJwtPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;

      // JWT payload is base64url encoded (not plain base64)
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  private extractUserId(source: any): string | null {
    if (!source) return null;
    const candidate = source.userId ?? source._id ?? source.id;

    if (typeof candidate === 'string') return candidate;
    if (candidate && typeof candidate === 'object') {
      if (typeof candidate.$oid === 'string') return candidate.$oid;
      if (typeof candidate.toString === 'function') {
        const asString = candidate.toString();
        if (asString && asString !== '[object Object]') return asString;
      }
    }

    return null;
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser.set(user);
    if (!user) {
      localStorage.removeItem(this.USER_KEY);
      return;
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private restoreSession(): void {
    const rawUser = localStorage.getItem(this.USER_KEY);
    if (!rawUser) return;
    try {
      const parsed = JSON.parse(rawUser) as User;
      if (parsed?._id && parsed?.email && parsed?.role) {
        this.currentUser.set(parsed);
      }
    } catch {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  logout(): void {
    this.clearToken();
    this.setCurrentUser(null);
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
            this.setCurrentUser(res.user as User);
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
