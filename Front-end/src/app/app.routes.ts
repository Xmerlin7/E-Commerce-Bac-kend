import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { Register } from './pages/register/register';
export const routes: Routes = [
  // 1. المسار الافتراضي (أول ما يفتح الموقع)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // 2. مسار صفحة الهوم
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  // 3. مسار صفحة اللوج إن
  { path: 'login', component: LoginComponent },
  
  // 4. مسار "الضياع" (لو كتب لينك غلط)
  { path: '**', redirectTo: 'home' } 
];