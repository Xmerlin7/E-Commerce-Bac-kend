import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserResponse,
  UsersResponse,
} from '../../../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}`;
  getUsers() {
    return this.http.get<UsersResponse>(`${this.url}/users`);
  }

  getUser(userId: string) {
    return this.http.get<UserResponse>(`${this.url}/users/${userId}`);
  }

  addUser(data: CreateUserPayload) {
    return this.http.post(`${this.url}/users`, data);
  }

  updateUser(userId: string, data: UpdateUserPayload) {
    return this.http.put<UserResponse>(`${this.url}/users/${userId}`, data);
  }

  deleteUser(userId: string) {
    return this.http.delete(`${this.url}/users/${userId}`);
  }
}
