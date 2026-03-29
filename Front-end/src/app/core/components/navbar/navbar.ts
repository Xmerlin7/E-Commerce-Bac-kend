import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService); // بنحقن الخدمة هنا
  private router = inject(Router);


  onLogoutClick() {
    this.authService.logoutRequest().subscribe({
      next: (res) => {
        console.log('Server said:', res.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed on server', err);

        this.router.navigate(['/login']);
      }
    });
  }
}
