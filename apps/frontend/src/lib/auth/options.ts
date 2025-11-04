import type { NextAuthOptions } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";

import {
  ensureDirectusUser,
  loginWithDirectus,
  refreshDirectusToken,
} from "@/lib/auth/directus";

const credentialsEnabled = Boolean(process.env.DIRECTUS_URL);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      version: "2.0",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: {
        keyId: process.env.APPLE_KEY_ID ?? "",
        privateKey: process.env.APPLE_PRIVATE_KEY?.split("\\n").join("\n") ?? "",
        teamId: process.env.APPLE_TEAM_ID ?? "",
      },
    }),
    credentialsEnabled
      ? CredentialsProvider({
          name: "Email & Password",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials.password) {
              throw new Error("Missing credentials");
            }

            const auth = await loginWithDirectus(credentials.email, credentials.password);
            if (!auth?.user?.id) {
              return null;
            }

            const accessTokenExpires = auth.expires_at
              ? new Date(auth.expires_at).getTime()
              : auth.expires
                ? Date.now() + auth.expires * 1000
                : undefined;

            return {
              id: auth.user.id,
              email: auth.user.email ?? credentials.email,
              name:
                (auth.user.display_name ??
                [auth.user.first_name, auth.user.last_name].filter(Boolean).join(" ")) ||
                  credentials.email,
              directusAccessToken: auth.access_token,
              directusRefreshToken: auth.refresh_token,
              directusAccessTokenExpires,
            } as any;
          },
        })
      : null,
  ].filter(Boolean),
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) {
        return false;
      }

      if (account?.provider === "credentials") {
        return true;
      }

      await ensureDirectusUser({
        email: user.email,
        firstName: (profile as any)?.given_name ?? (profile as any)?.first_name,
        lastName: (profile as any)?.family_name ?? (profile as any)?.last_name,
        displayName: user.name ?? undefined,
        provider: account?.provider,
      });

      return true;
    },
    async jwt({ token, account, user }) {
      if (user && account?.provider === "credentials") {
        token.directusAccessToken = (user as any).directusAccessToken;
        token.directusRefreshToken = (user as any).directusRefreshToken;
        token.directusAccessTokenExpires = (user as any).directusAccessTokenExpires;
        token.directusUserId = user.id;
      }

      if (user && account && account.provider !== "credentials") {
        if (!token.directusUserId) {
          const directusUser = await ensureDirectusUser({
            email: user.email!,
            displayName: user.name ?? undefined,
            provider: account.provider,
          });
          token.directusUserId = directusUser.id;
        }
      }

      const accessTokenExpires = token.directusAccessTokenExpires as number | undefined;
      const shouldAttemptRefresh = Boolean(
        token.directusRefreshToken &&
          token.directusAccessToken &&
          accessTokenExpires &&
          Date.now() > accessTokenExpires - 60_000,
      );

      if (shouldAttemptRefresh) {
        try {
          const refreshed = await refreshDirectusToken(token.directusRefreshToken as string);
          const refreshedExpiresAt = refreshed.expires_at
            ? new Date(refreshed.expires_at).getTime()
            : refreshed.expires
              ? Date.now() + refreshed.expires * 1000
              : undefined;

          token.directusAccessToken = refreshed.access_token;
          token.directusRefreshToken = refreshed.refresh_token ?? token.directusRefreshToken;
          token.directusAccessTokenExpires = refreshedExpiresAt;
        } catch (error) {
          console.error("Failed to refresh Directus token", error);
          delete token.directusAccessToken;
          delete token.directusAccessTokenExpires;
          delete token.directusRefreshToken;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.directusUserId as string) ?? (token.sub as string);
        session.user.directusAccessToken = token.directusAccessToken as string | undefined;
        session.user.directusRefreshToken = token.directusRefreshToken as string | undefined;
        (session.user as any).directusAccessTokenExpires = token.directusAccessTokenExpires as number | undefined;
      }
      return session;
    },
  },
  events: {
    async error(message) {
      console.error("Auth error", message);
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const authOptionsNoRedirect: NextAuthOptions = {
  ...authOptions,
  pages: {},
};
