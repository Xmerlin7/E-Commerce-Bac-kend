import { Component, inject } from '@angular/core';
import { ProductService } from '../../../../core/services/products/productService';

@Component({
  selector: 'app-edit-product',
  imports: [],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct {
  public productService = inject(ProductService);
  ngOnInit() {
    this.loadProducts();
  }
  loadProducts() {
    this.productService.getAllProducts().subscribe((response) => {
      this.productService.productsSignal.set(response?.data);
    });
  }
  
}
