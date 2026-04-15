import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { CategoryService } from '../../core/services/categories/category.service';
import { ProductService } from '../../core/services/products/productService';
import { Category } from '../../models/category.model';
import { Product } from '../../models/products.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role ?? this.authService.getRoleFromToken();
    return role === 'admin';
  });
  featuredProducts = computed(() => this.products().slice(0, 8));
  topCategories = computed(() => this.categories().slice(0, 6));

  ngOnInit() {
    this.loadHomeData();
  }

  loadHomeData() {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      productsRes: this.productService.getAllProducts(),
      categoriesRes: this.categoryService.getAllCategories(),
    }).subscribe({
      next: ({ productsRes, categoriesRes }) => {
        this.products.set(this.productService.normalizeProductList(productsRes));
        this.categories.set(categoriesRes?.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to load home data.');
        this.loading.set(false);
      },
    });
  }
}
