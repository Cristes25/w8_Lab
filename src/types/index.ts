// src/types/index.ts
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}