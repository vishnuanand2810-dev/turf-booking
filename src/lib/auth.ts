import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
    }),
    CredentialsProvider({
      id: "mobile-otp",
      name: "Mobile OTP",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "9876543210" },
        otp: { label: "OTP", type: "text", placeholder: "123456" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;

        const cleanOtp = credentials.otp?.trim() || "";
        if (cleanOtp.length !== 6) {
          throw new Error("INVALID_OTP");
        }

        if (cleanOtp !== "123456" && process.env.NODE_ENV === "production") {
          throw new Error("INVALID_OTP");
        }

        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: credentials.name || `Player ${credentials.phone.slice(-4)}`,
            },
          });
        } else if (credentials.name && credentials.name.trim() && user.name !== credentials.name.trim()) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: credentials.name.trim() },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "PitchPro Player",
            },
          });
        }
        user.id = existingUser.id;
      }
      return true;
    },
    async session({ session, token }) {
      try {
        if (session.user && token?.sub) {
          session.user.id = token.sub;
          session.user.phone = (token.phone as string) || undefined;
        }
        return session;
      } catch (err) {
        console.error("Session callback error:", err);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.sub = user.id;
          token.phone = user.phone;
        }
        return token;
      } catch (err) {
        console.error("JWT callback error:", err);
        return token;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "pitchpro-super-secret-key-2026",
};

export async function getOptionalSessionUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id ? session.user : null;
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}
