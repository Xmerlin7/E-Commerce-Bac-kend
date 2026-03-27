import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AuthResponse, User } from '../../models/users.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient); // الـ Injectable اللي كنت ناسيها، أهي جت دليفري!
  private apiUrl = `${environment.apiUrl}/auth`; // ده الـ URL اللي ربطناه بالباك-إيند

  // الـ Signal ده هو "المخزن" اللي هيعرفنا اليوزر عامل Login ولا لأ في أي مكان في الموقع
  currentUser = signal<User | null>(null);

  login(credentials: any) {
  // تأكد من الـ URL هنا يا سيف 👈
  return this.http.post<AuthResponse>(`http://localhost:8080/api/login`, credentials).pipe(
    tap((res: AuthResponse) => {
  if (res.token && res.user) {
    localStorage.setItem('userToken', res.token);
    
    // بنستخدم "as User" عشان نقول للـ TS: "ثق فيا أنا عارف إن الـ role صح"
    this.currentUser.set(res.user as User); 
    
    console.log('Login Success! ✅ User Role:', res.user.role);
  }
})
  );
}
}