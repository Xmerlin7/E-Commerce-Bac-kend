import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Product } from '../../../models/products.model';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  productsSignal = signal<Product[]>([])
  getAllProducts(){
    return this.http.get<any>(`${this.url}/products`)
  }
  addProduct(product: Product){
    return this.http.post(`${this.url}/products`, product)
  }
  updateProduct(id: string, product: Product){
    return this.http.put(`${this.url}/products/${id}`, product)
  }
  deleteProduct(id: string){
    return this.http.delete(`${this.url}/products ${id}`)
  }
}
