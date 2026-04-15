import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart/cartService';
import { CartItem } from '../../models/cart.model';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartPage {
  private auth = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  cart = this.cartService.cart;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  pendingProductId = signal<string | null>(null);
  private checkoutInFlight = false;

  private splitName(fullName: string | null): { firstName: string; lastName: string } {
    const fallback = { firstName: 'ShopWave', lastName: 'Customer' };
    if (!fullName || typeof fullName !== 'string') return fallback;
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return fallback;
    if (parts.length === 1) return { firstName: parts[0], lastName: 'Customer' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  items = computed<CartItem[]>(() => {
    const products = this.cart()?.products ?? [];
    return products.filter(
      (item) =>
        !!item &&
        !!item.product &&
        typeof item.product === 'object' &&
        typeof item.product._id === 'string',
    );
  });

  total = computed(() => {
    return this.items().reduce((sum, item) => {
      const price = Number(item?.product?.price ?? 0);
      const qty = Number(item?.quantity ?? 0);
      return sum + price * qty;
    }, 0);
  });

  ngOnInit() {
    this.loadCart();
  }

  private getUserId(): string | null {
    return this.auth.getCurrentUserId();
  }

  private setCartFromResponse(res: any) {
    if (res?.data !== undefined) this.cart.set(res.data);
  }

  loadCart() {
    const userId = this.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.cartService.getCart(userId).subscribe({
      next: (res) => {
        this.setCartFromResponse(res);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        this.errorMessage.set(err?.error?.message ?? 'Failed to load cart.');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  onIncrease(item: CartItem) {
    const userId = this.getUserId();
    if (!userId) return;
    if (!item?.product?._id) return;

    this.pendingProductId.set(item.product._id);
    this.errorMessage.set(null);
    this.cartService.setQuantity(userId, item.product._id, item.quantity + 1).subscribe({
      next: (res) => {
        this.setCartFromResponse(res);
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to update quantity.');
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
    });
  }

  onDecrease(item: CartItem) {
    const userId = this.getUserId();
    if (!userId) return;
    if (!item?.product?._id) return;
    if (item.quantity <= 1) {
      this.onRemove(item);
      return;
    }

    this.pendingProductId.set(item.product._id);
    this.errorMessage.set(null);
    this.cartService.setQuantity(userId, item.product._id, item.quantity - 1).subscribe({
      next: (res) => {
        this.setCartFromResponse(res);
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to update quantity.');
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
    });
  }

  onRemove(item: CartItem) {
    const userId = this.getUserId();
    if (!userId) return;
    if (!item?.product?._id) return;

    this.pendingProductId.set(item.product._id);
    this.errorMessage.set(null);
    this.cartService.removeFromCart(userId, item.product._id).subscribe({
      next: (res) => {
        this.setCartFromResponse(res);
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to remove item.');
        this.pendingProductId.set(null);
        this.cdr.detectChanges();
      },
    });
  }

  onCheckoutClick() {
    if (this.loading() || this.checkoutInFlight) return;
    this.checkoutInFlight = true;

    const total = this.total();
    const amountCents = Math.round(total * 100);
    if (amountCents <= 0) {
      this.errorMessage.set('Cart total must be greater than 0.');
      this.checkoutInFlight = false;
      return;
    }

    const currentUser = this.auth.currentUser();
    const nameParts = this.splitName(currentUser?.name ?? null);
    const email = currentUser?.email?.trim() || 'customer@shopwave.local';
    const phone = '+201000000000';

    this.loading.set(true);
    this.errorMessage.set(null);
    this.cartService
      .createPaymobCheckout({
        amountCents,
        currency: 'EGP',
        payment_methods: [environment.paymobIntegrationId],
        billing_data: {
          first_name: nameParts.firstName,
          last_name: nameParts.lastName,
          email,
          phone_number: phone,
        },
      })
      .subscribe({
      next: (res) => {
        const checkoutUrl = res?.checkoutUrl;
        const merchantOrderId = res?.merchantOrderId;
        if (!checkoutUrl) {
          this.errorMessage.set('Checkout URL was not returned.');
          this.loading.set(false);
          this.checkoutInFlight = false;
          this.cdr.detectChanges();
          return;
        }
        if (!merchantOrderId) {
          this.errorMessage.set('merchantOrderId was not returned.');
          this.loading.set(false);
          this.checkoutInFlight = false;
          this.cdr.detectChanges();
          return;
        }

        sessionStorage.setItem('lastMerchantOrderId', merchantOrderId);
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to start checkout.');
        this.loading.set(false);
        this.checkoutInFlight = false;
        this.cdr.detectChanges();
      },
    });
  }
}
