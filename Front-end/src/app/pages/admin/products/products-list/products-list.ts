import { Component, inject } from '@angular/core';
import { ProductService } from '../../../../core/services/products/productService';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-products-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class ProductsList {
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
