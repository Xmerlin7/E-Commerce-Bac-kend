import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, of } from 'rxjs';
import { catchError, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart/cartService';

@Component({
  selector: 'app-payment-result',
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResultPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  merchantOrderId = signal<string | null>(null);
  status = signal<'pending' | 'paid' | 'failed'>('pending');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id =
      this.route.snapshot.queryParamMap.get('merchantOrderId') ||
      sessionStorage.getItem('lastMerchantOrderId');
    if (!id) {
      this.error.set('Missing merchantOrderId.');
      this.loading.set(false);
      return;
    }

    this.merchantOrderId.set(id);
    this.startPolling(id);
  }

  private startPolling(merchantOrderId: string) {
    interval(2500)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.cartService.getPaymentStatus(merchantOrderId).pipe(
            catchError((err) => {
              if (err?.status === 404) {
                return of({ status: 'pending' as const });
              }
              this.error.set(err?.error?.message ?? 'Failed to fetch payment status.');
              return of({ status: this.status() });
            }),
          ),
        ),
        takeWhile((res) => res.status === 'pending', true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.status.set(res.status);
        this.loading.set(false);
      });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goCart() {
    this.router.navigate(['/cart']);
  }
}
