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
import { EditProduct } from './pages/admin/products/edit-product/edit-product';
import { AddProduct } from './pages/admin/products/add-product/add-product';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductsList },
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

      {
        path: 'products',
        children: [
          { path: '', component: ProductsList },      // يفتح عند /admin/products
          { path: 'add', component: AddProduct },     // يفتح عند /admin/products/add
          { path: 'edit/:id', component: EditProduct } // يفتح عند /admin/products/edit/123
        ]
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
