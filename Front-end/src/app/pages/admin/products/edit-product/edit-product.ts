import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/products/productService';
import { Product } from '../../../../models/products.model';

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct {
  public productService = inject(ProductService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  productId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    inStock: ['yes', [Validators.required]],
    category: ['', [Validators.required]],
    image: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId.set(id);
    if (!id) {
      this.router.navigate(['/admin/products']);
      return;
    }

    this.loadProduct(id);
  }

  private loadProduct(id: string) {
    this.errorMessage.set(null);

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        const product: Product | undefined = res?.data;
        if (!product) {
          this.errorMessage.set('Product not found.');
          this.cdr.detectChanges();
          return;
        }

        const categoryId =
          typeof product.category === 'string' ? product.category : (product.category?._id ?? '');

        this.productForm.patchValue({
          title: product.title,
          description: product.description,
          price: product.price,
          inStock: product.inStock ?? 'yes',
          category: categoryId,
          image: product.image ?? '',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to load product.');
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit() {
    const id = this.productId();
    if (!id) return;
    if (this.productForm.invalid) return;

    this.errorMessage.set(null);
    this.cdr.detectChanges();

    const v = this.productForm.getRawValue();
    const payload = {
      title: v.title,
      description: v.description,
      price: Number(v.price),
      inStock: v.inStock,
      category: v.category,
      image: v.image || undefined,
    };

    this.productService.updateProduct(id, payload as any).subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Update failed.');
        this.cdr.detectChanges();
      },
    });
  }

  onDelete() {
    const id = this.productId();
    if (!id) return;

    this.errorMessage.set(null);
    this.cdr.detectChanges();

    this.productService.deleteProduct(id).subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Delete failed.');
        this.cdr.detectChanges();
      },
    });
  }
}
