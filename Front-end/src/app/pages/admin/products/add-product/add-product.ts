import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductService } from '../../../../core/services/products/productService';
import { Router } from '@angular/router';
import { Product } from '../../../../models/products.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  public productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],

    description: ['', [Validators.required]],

    price: [0, [Validators.required, Validators.min(0)]],

    inStock: ['yes', [Validators.required]],

    category: ['', [Validators.required]],

    image: [''],
  });

  onSubmit() {
    if (this.productForm.valid) {
      const formValues = this.productForm.getRawValue();

      const baseData = {
        title: formValues.title, // الاسم الجديد
        description: formValues.description,
        price: Number(formValues.price),
        inStock: formValues.inStock,
        category: formValues.category,
        image:
          formValues.image ||
          'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
      };

      this.productService.addProduct(baseData as any).subscribe({
        next: () => this.router.navigate(['/admin/products']),
        error: (err) => console.log('The Error is:', err.error),
      });
    }
  }
}
