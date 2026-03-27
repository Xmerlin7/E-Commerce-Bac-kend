import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AuthResponse, User } from '../../models/users.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}`;

  currentUser = signal<User | null>(null);

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials).pipe(
      tap((res: AuthResponse) => {
        if (res.token && res.user) {
          localStorage.setItem('userToken', res.token);

          this.currentUser.set(res.user as User);

          console.log('Login Success! ✅ User Role:', res.user.role);
        }
      }),
    );
  }
}
