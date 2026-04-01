import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { UsersResponse } from '../../../models/users.model';
import { CreateUserPayload } from '../../../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}`;
  getUsers() {
    return this.http.get<UsersResponse>(`${this.url}/users`);
  }

  addUser(data: CreateUserPayload) {
    return this.http.post(`${this.url}/users`, data);
  }
}
