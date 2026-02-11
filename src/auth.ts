import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const { pathname } = nextUrl;

      // Public route - login page
      if (pathname === '/login') {
        if (isLoggedIn) {
          // Redirect logged-in users to their dashboard
          const dashboardUrl = userRole === 'ADMINISTRATOR' ? '/admin'
            : userRole === 'MANAGER' ? '/manager'
              : '/member';
          return Response.redirect(new URL(dashboardUrl, nextUrl));
        }
        return true;
      }

      // Protected routes - require login
      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      // Role-based access control
      if (pathname.startsWith('/admin') && userRole !== 'ADMINISTRATOR') {
        return Response.redirect(new URL('/unauthorized', nextUrl));
      }

      if (pathname.startsWith('/manager') && userRole !== 'MANAGER' && userRole !== 'ADMINISTRATOR') {
        return Response.redirect(new URL('/unauthorized', nextUrl));
      }

      if (pathname.startsWith('/member') && userRole !== 'MEMBER') {
        return Response.redirect(new URL('/unauthorized', nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
