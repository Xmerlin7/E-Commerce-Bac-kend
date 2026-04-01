import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserService } from '../../../../core/services/users/userService';
import { User } from '../../../../models/users.model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-users',
  imports: [NgClass, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UserComponent {
  private userService = inject(UserService);
  users = signal<User[]>([]);
  ngOnInit() {
    this.loadUsers();
  }
  loadUsers() {
    this.userService.getUsers().subscribe((response) => this.users.set(response.data));
  }
}
