import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { favoriteTeam: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
          username: user.username,
          favoriteTeamId: user.favoriteTeamId,
          favoriteTeamFlag: user.favoriteTeam?.flagCode ?? null,
          favoriteTeamShort: user.favoriteTeam?.shortName ?? null,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.username = (user as any).username;
        token.favoriteTeamId = (user as any).favoriteTeamId;
        token.favoriteTeamFlag = (user as any).favoriteTeamFlag;
        token.favoriteTeamShort = (user as any).favoriteTeamShort;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.username = token.username as string;
      session.user.favoriteTeamId = token.favoriteTeamId as number | null;
      session.user.favoriteTeamFlag = token.favoriteTeamFlag as string | null;
      session.user.favoriteTeamShort = token.favoriteTeamShort as string | null;
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
});
