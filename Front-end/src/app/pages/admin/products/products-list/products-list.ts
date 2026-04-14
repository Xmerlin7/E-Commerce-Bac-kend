import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../../../core/services/products/productService';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { CartService } from '../../../../core/services/cart/cartService';
import { Router } from '@angular/router';
@Component({
  selector: 'app-products-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class ProductsList {
  public productService = inject(ProductService);
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  cartPendingProductId = signal<string | null>(null);
  cartFeedbackProductId = signal<string | null>(null);
  cartSuccessProductId = signal<string | null>(null);
  cartError = signal<string | null>(null);

  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role ?? this.authService.getRoleFromToken();
    return role === 'admin';
  });

  ngOnInit() {
    this.loadProducts();
  }
  loadProducts() {
    this.productService.getAllProducts().subscribe((response) => {
      this.productService.productsSignal.set(this.productService.normalizeProductList(response));
    });
  }

  onDeleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
    });
  }

  onAddToCart(productId: string) {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartPendingProductId.set(productId);
    this.cartFeedbackProductId.set(productId);
    this.cartSuccessProductId.set(null);
    this.cartError.set(null);

    this.cartService.addToCart(userId, productId, 1).subscribe({
      next: () => {
        this.cartSuccessProductId.set(productId);
        this.cartPendingProductId.set(null);

        // Auto-hide the success state after a moment
        setTimeout(() => {
          if (this.cartSuccessProductId() === productId) {
            this.cartSuccessProductId.set(null);
          }
        }, 1500);
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        this.cartError.set(err?.error?.message ?? 'Failed to add to cart.');
        this.cartPendingProductId.set(null);
      },
    });
  }
}
