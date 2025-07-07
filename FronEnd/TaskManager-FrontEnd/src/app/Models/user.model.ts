export interface User {
    userId: number;
    username: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  export interface AuthResponse {
    userId: number;
    username: string;
  }