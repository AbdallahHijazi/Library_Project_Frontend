export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  caniformPassword: string; // نفس اسم الباك
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string; // ISO
}