import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart/cartService';

type OrderItem = {
  id: string;
  merchantOrderId: string;
  status: 'pending' | 'paid' | 'failed';
  paidAt: string | null;
  amountCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  providerTransactionId: string | null;
};

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersPage {
  private cartService = inject(CartService);
  private router = inject(Router);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  orders = signal<OrderItem[]>([]);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);
    this.error.set(null);
    this.cartService.getUserOrders(50).subscribe({
      next: (res) => {
        this.orders.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        this.error.set(err?.error?.message ?? 'Failed to load orders.');
        this.loading.set(false);
      },
    });
  }

  formatAmount(amountCents: number) {
    return (Number(amountCents) / 100).toFixed(2);
  }
}
