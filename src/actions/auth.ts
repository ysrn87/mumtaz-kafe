'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  try {
    await signIn('credentials', {
      identifier,
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

export async function registerMemberAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const password = formData.get('password') as string;
    const birthday = formData.get('birthday') as string;

    if (!name || !phone || !password) {
      return { success: false, error: 'Name, phone number, and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Import db and bcrypt
    const { db } = await import('@/lib/db');
    const bcrypt = await import('bcryptjs');

    // Check if phone already exists
    const existingPhone = await db.user.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return { success: false, error: 'Phone number already registered' };
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await db.user.findFirst({
        where: { email },
      });

      if (existingEmail) {
        return { success: false, error: 'Email already registered' };
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new member
    await db.user.create({
      data: {
        name,
        phone,
        email: email,
        address: address || null,
        password: hashedPassword,
        birthday: birthday ? new Date(birthday) : null,
        role: 'MEMBER',
        points: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}