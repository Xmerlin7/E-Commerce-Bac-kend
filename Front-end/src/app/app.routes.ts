import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component'; // استدعاء الملف

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // طريق افتراضي عشان لو اليوزر دخل على "/" يوديه للـ login
  { path: '', redirectTo: 'login', pathMatch: 'full' } 
];