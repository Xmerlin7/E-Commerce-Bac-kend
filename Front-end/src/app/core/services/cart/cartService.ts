import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { tap } from 'rxjs';
import { Cart } from '../../../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  // Shared cart state so the UI can reflect changes immediately across pages.
  cart = signal<Cart | null>(null);

  getCart(userId: string) {
    return this.http.get<any>(`${this.url}/carts/user/${userId}`).pipe(
      tap((res) => {
        if (res?.data !== undefined) this.cart.set(res.data);
      }),
    );
  }

  addToCart(userId: string, productId: string, quantity: number = 1) {
    return this.http
      .post<any>(`${this.url}/carts/user/${userId}`, {
        productId,
        quantity,
      })
      .pipe(
        tap((res) => {
          if (res?.data !== undefined) this.cart.set(res.data);
        }),
      );
  }

  setQuantity(userId: string, productId: string, quantity: number) {
    return this.http
      .patch<any>(`${this.url}/carts/user/${userId}`, {
        productId,
        quantity,
      })
      .pipe(
        tap((res) => {
          if (res?.data !== undefined) this.cart.set(res.data);
        }),
      );
  }

  removeFromCart(userId: string, productId: string) {
    return this.http
      .delete<any>(`${this.url}/carts/user/${userId}`, {
        body: { productId },
      })
      .pipe(
        tap((res) => {
          if (res?.data !== undefined) this.cart.set(res.data);
        }),
      );
  }

  createPaymobCheckout(payload: {
    amountCents: number;
    currency?: string;
    payment_methods?: number[];
    billing_data: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
    };
  }) {
    return this.http.post<{
      message: string;
      checkoutUrl: string;
      merchantOrderId: string;
      clientSecret: string;
    }>(`${this.url}/payments/paymob/checkout`, payload);
  }

  getPaymentStatus(merchantOrderId: string) {
    return this.http.get<{
      merchantOrderId: string;
      status: 'pending' | 'paid' | 'failed';
      paidAt: string | null;
      amountCents: number;
      currency: string;
    }>(`${this.url}/payments/paymob/status/${merchantOrderId}`);
  }

  getUserOrders(limit: number = 50) {
    return this.http.get<{
      count: number;
      data: Array<{
        id: string;
        merchantOrderId: string;
        status: 'pending' | 'paid' | 'failed';
        paidAt: string | null;
        amountCents: number;
        currency: string;
        createdAt: string;
        updatedAt: string;
        providerTransactionId: string | null;
      }>;
    }>(`${this.url}/payments/paymob/orders?limit=${limit}`);
  }
}
