import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule], // 👈 مهم جداً
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // تعريف الفورم والـ Validations
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('Success Response:', res); // 👈 ده اللي هيأكدلك الـ Data اللي رجعت
        alert('دخلت بنجاح يا سيف! بص على الـ Console');
      },
      error: (err) => {
        console.error('Login Failed:', err);
        alert('فشل الدخول، بص على الـ Console للأحداث الحمراء');
      },
    });
  }
}
