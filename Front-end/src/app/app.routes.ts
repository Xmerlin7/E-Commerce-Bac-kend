import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { Register } from './pages/register/register';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { roleGuard } from './core/guards/role-guard';
import { UserComponent } from './pages/admin/users/userList/users';
import { AddUserFormComponent } from './pages/admin/users/add-user/add-user';
import { ProductsList } from './pages/admin/products/products-list/products-list';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: UserComponent },
      { path: 'users/add', component: AddUserFormComponent },
      { path: 'users/edit/:id', component: AddUserFormComponent },
      { path: 'products', component: ProductsList },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
