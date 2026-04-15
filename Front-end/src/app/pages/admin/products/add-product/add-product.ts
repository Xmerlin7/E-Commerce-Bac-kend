import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductService } from '../../../../core/services/products/productService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../../core/services/categories/category.service';
import { Category } from '../../../../models/category.model';
@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  public productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  categories = signal<Category[]>([]);
  categoriesLoading = signal<boolean>(false);
  categoryError = signal<string | null>(null);
  creatingCategory = signal<boolean>(false);
  creatingCategoryError = signal<string | null>(null);
  creatingCategorySuccess = signal<string | null>(null);
  selectedImageFile = signal<File | null>(null);

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],

    description: ['', [Validators.required]],

    price: [0, [Validators.required, Validators.min(0)]],

    inStock: ['yes', [Validators.required]],

    category: ['', [Validators.required]],

  });

  newCategoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesLoading.set(true);
    this.categoryError.set(null);

    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res?.data ?? []);
        this.categoriesLoading.set(false);
      },
      error: (err) => {
        this.categoryError.set(err?.error?.message ?? 'Failed to load categories.');
        this.categoriesLoading.set(false);
      },
    });
  }

  onCreateCategory() {
    if (this.newCategoryForm.invalid) {
      this.newCategoryForm.markAllAsTouched();
      return;
    }

    const name = this.newCategoryForm.getRawValue().name?.trim();
    if (!name) return;

    this.creatingCategory.set(true);
    this.creatingCategoryError.set(null);
    this.creatingCategorySuccess.set(null);

    this.categoryService.createCategory(name).subscribe({
      next: () => {
        this.creatingCategory.set(false);
        this.creatingCategorySuccess.set('Category created successfully.');
        this.newCategoryForm.reset({ name: '' });
        this.loadCategories();
      },
      error: (err) => {
        this.creatingCategory.set(false);
        this.creatingCategoryError.set(err?.error?.message ?? 'Failed to create category.');
      },
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValues = this.productForm.getRawValue();
      const payload = new FormData();
      payload.append('title', formValues.title ?? '');
      payload.append('description', formValues.description ?? '');
      payload.append('price', String(Number(formValues.price)));
      payload.append('inStock', (formValues.inStock as 'yes' | 'no') ?? 'yes');
      payload.append('category', formValues.category ?? '');

      const imageFile = this.selectedImageFile();
      if (imageFile) payload.append('imageFile', imageFile);

      this.productService.addProduct(payload).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: (err) => console.log('The Error is:', err.error),
      });
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile.set(file);
  }
}
