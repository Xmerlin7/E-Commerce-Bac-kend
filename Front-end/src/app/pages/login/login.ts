import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  conflictMessage = signal<string | null>(null);
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(forceLogin = false) {
    const credentials = this.loginForm.getRawValue();

    this.conflictMessage.set(null);
    this.cdr.detectChanges();

    this.authService.login({ ...credentials, forceLogin }).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (err.status === 409) {
          this.conflictMessage.set(
            err?.error?.message || 'You are already logged in on another device.',
          );
          this.cdr.detectChanges();
          return;
        }

        console.error('Login Failed:', err);
      },
    });
  }
}
