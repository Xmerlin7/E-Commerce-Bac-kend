export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user'; // الـ Literals اللي عاملة المشكلة
}

// src/app/core/models/auth.model.ts

export interface AuthResponse {
  message: string;
  token: string;
  user: User; // 👈 استخدم الـ User interface هنا مباشرة بدل ما تعرفه تاني كـ string
}