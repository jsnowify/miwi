import { createAuthClient } from 'better-auth/react';
import { api } from './api';
export const authClient = createAuthClient();
export async function requestReset(email) {
  const config = await api('/config');
  if (!config.passwordReset) return { error: { message: 'Password reset email is not configured. Contact the app administrator.' } };
  return authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` });
}