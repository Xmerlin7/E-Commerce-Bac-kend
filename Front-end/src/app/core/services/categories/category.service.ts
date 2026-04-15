import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Category } from '../../../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  getAllCategories() {
    return this.http.get<{ message: string; data: Category[] }>(`${this.url}/category`);
  }

  createCategory(name: string) {
    return this.http.post<{ message: string; data: { id: string } }>(`${this.url}/category`, {
      name,
    });
  }
}

