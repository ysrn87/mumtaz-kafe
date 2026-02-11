'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid credentials' };
        default:
          return { success: false, error: 'Something went wrong' };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
