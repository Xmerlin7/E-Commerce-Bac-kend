import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/users/userService';
import { CommonModule } from '@angular/common';
import { CreateUserPayload, UpdateUserPayload } from '../../../../models/users.model';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.html',
})
export class AddUserFormComponent {
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  errorMessage: string | null = null;
  isEditMode = false;
  userId: string | null = null;

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;
    this.userId = id;
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();

    this.userService.getUser(id).subscribe({
      next: (response) => {
        const user = response.data;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
        });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Could not load user data';
      },
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.errorMessage = null;
      const formValue = this.userForm.getRawValue();
      const role = formValue.role === 'admin' ? 'admin' : 'user';
      const baseData: {
        name: string;
        email: string;
        role: 'admin' | 'user';
      } = {
        name: formValue.name,
        email: formValue.email,
        role,
      };

      if (this.isEditMode && this.userId) {
        const updateData: UpdateUserPayload = { ...baseData };

        if (formValue.password.trim()) {
          updateData.password = formValue.password;
        }

        this.userService.updateUser(this.userId, updateData).subscribe({
          next: () => {
            this.router.navigate(['/admin/users']);
          },
          error: (err) => {
            console.error('Error updating user', err);
            this.errorMessage = err?.error?.message || 'Error on update';
          },
        });
        return;
      }

      const userData: CreateUserPayload = {
        ...baseData,
        password: formValue.password,
      };

      this.userService.addUser(userData).subscribe({
        next: () => {
          this.userForm.reset({ role: 'user' });
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          console.error('Error adding user', err);
          this.errorMessage = err?.error?.message || 'Error on addition';
        },
      });
    }
  }
}
