import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../../core/services/categories/category.service';
import { ProductService } from '../../../core/services/products/productService';
import { UserService } from '../../../core/services/users/userService';
import { Category } from '../../../models/category.model';
import { Product } from '../../../models/products.model';
import { User } from '../../../models/users.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private userService = inject(UserService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  loading = signal(true);
  error = signal<string | null>(null);

  users = signal<User[]>([]);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  usersCount = computed(() => this.users().length);
  productsCount = computed(() => this.products().length);
  categoriesCount = computed(() => this.categories().length);
  inStockCount = computed(() => this.products().filter((p) => p.inStock === 'yes').length);
  outOfStockCount = computed(() => this.products().filter((p) => p.inStock === 'no').length);
  totalInventoryValue = computed(() =>
    this.products().reduce((sum, product) => sum + Number(product.price || 0), 0),
  );
  latestProducts = computed(() => this.products().slice(0, 5));

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      users: this.userService.getUsers(),
      products: this.productService.getAllProducts(),
      categories: this.categoryService.getAllCategories(),
    }).subscribe({
      next: ({ users, products, categories }) => {
        this.users.set(users?.data ?? []);
        this.products.set(this.productService.normalizeProductList(products));
        this.categories.set(categories?.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}
