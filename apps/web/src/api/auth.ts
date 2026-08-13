import { apiClient } from './client';
import {
  RegisterInput,
  LoginInput,
  User,
} from '@ishraq/shared-types';

export interface AuthResponse {
  user: User;
  message: string;
}

export interface GenericMessageResponse {
  message: string;
}

export const registerApi = async (data: RegisterInput): Promise<AuthResponse> => {
  return apiClient<AuthResponse>('/api/auth/register', {
    method: 'POST',
    data,
  });
};

export const verifyEmailApi = async (token: string): Promise<GenericMessageResponse> => {
  return apiClient<GenericMessageResponse>(`/api/auth/verify-email/${encodeURIComponent(token)}`, {
    method: 'GET',
  });
};

export const resendVerificationApi = async (email: string): Promise<GenericMessageResponse> => {
  return apiClient<GenericMessageResponse>('/api/auth/resend-verification', {
    method: 'POST',
    data: { email },
  });
};

export const loginApi = async (data: LoginInput): Promise<AuthResponse> => {
  return apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    data,
  });
};

export const logoutApi = async (): Promise<GenericMessageResponse> => {
  return apiClient<GenericMessageResponse>('/api/auth/logout', {
    method: 'POST',
  });
};

export const forgotPasswordApi = async (email: string): Promise<GenericMessageResponse> => {
  return apiClient<GenericMessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    data: { email },
  });
};

export const resetPasswordApi = async (
  token: string,
  newPassword: string
): Promise<GenericMessageResponse> => {
  return apiClient<GenericMessageResponse>(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: 'POST',
    data: { newPassword },
  });
};

export const fetchMeApi = async (): Promise<{ user: User }> => {
  return apiClient<{ user: User }>('/api/auth/me', {
    method: 'GET',
  });
};
