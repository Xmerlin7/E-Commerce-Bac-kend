import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart/cartService';
@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private lastSyncedCartUserId: string | null = null;

  cartItemsCount = computed(() => {
    const products = this.cartService.cart()?.products ?? [];
    return products.filter((item) => !!item?.product).length;
  });

  constructor() {
    this.syncCartIfNeeded();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncCartIfNeeded());
  }

  isAdmin(): boolean {
    const role = this.authService.currentUser()?.role ?? this.authService.getRoleFromToken();
    return role === 'admin';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private syncCartIfNeeded() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.lastSyncedCartUserId = null;
      this.cartService.cart.set(null);
      return;
    }

    if (this.lastSyncedCartUserId === userId) return;
    this.lastSyncedCartUserId = userId;
    this.cartService.getCart(userId).subscribe({
      error: () => {
        // Keep navbar stable even if cart API fails.
      },
    });
  }

  onLogoutClick() {
    this.authService.logoutRequest().subscribe({
      next: () => {
        this.lastSyncedCartUserId = null;
        this.cartService.cart.set(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        // Fall back to local logout even if server logout fails.
        this.authService.logout();
        this.lastSyncedCartUserId = null;
        this.cartService.cart.set(null);
        this.router.navigate(['/login']);
      },
    });
  }
}
