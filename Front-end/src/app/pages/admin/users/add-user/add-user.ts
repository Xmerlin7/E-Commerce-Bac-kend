import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/users/userService';
import { CommonModule } from '@angular/common';
import { CreateUserPayload } from '../../../../models/users.model';

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.html',
})
export class AddUserFormComponent {
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user', Validators.required],
  });

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const userData: CreateUserPayload = {
        ...formValue,
        role: formValue.role === 'admin' ? 'admin' : 'user',
      };

      this.userService.addUser(userData).subscribe({
        next: (res) => {
          console.log('User added successfully!', res);
          alert('تم إضافة المستخدم بنجاح');
          this.userForm.reset({ role: 'user' });
        },
        error: (err) => {
          console.error('Error adding user', err);
          alert('حدث خطأ أثناء الإضافة');
        },
      });
    }
  }
}
