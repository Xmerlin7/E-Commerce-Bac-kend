import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { CreateProductPayload, Product } from '../../../models/products.model';

type ProductListResponse = {
  data?: Product[] | { docs?: Product[] };
  docs?: Product[];
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  productsSignal = signal<Product[]>([]);

  normalizeProductList(response: ProductListResponse | null | undefined): Product[] {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.docs)) return response.data.docs;
    if (Array.isArray(response?.docs)) return response.docs;
    return [];
  }

  getAllProducts() {
    return this.http.get<ProductListResponse>(`${this.url}/products`);
  }

  getProductById(id: string) {
    return this.http.get<any>(`${this.url}/products/${id}`);
  }

  addProduct(product: CreateProductPayload | FormData) {
    return this.http.post(`${this.url}/products`, product);
  }
  updateProduct(id: string, product: Product) {
    return this.http.put(`${this.url}/products/${id}`, product);
  }
  deleteProduct(id: string) {
    return this.http.delete(`${this.url}/products/${id}`);
  }
}
