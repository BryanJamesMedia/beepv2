export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordErrors {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  special: boolean;
} 