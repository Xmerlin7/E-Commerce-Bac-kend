export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
export interface login {
  email: string | null;
  password: string | null;
  forceLogin?: boolean;
}
export interface register {
  name: string | null;
  email: string | null;
  password: string | null;
}
export interface UsersResponse {
  message: string;
  data: User[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}
