import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      directusAccessToken?: string;
      directusRefreshToken?: string;
      directusAccessTokenExpires?: number;
    };
  }

  interface User {
    directusAccessToken?: string;
    directusRefreshToken?: string;
    directusAccessTokenExpires?: number;
    directusCredentialsUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    directusAccessToken?: string;
    directusRefreshToken?: string;
    directusUserId?: string;
    directusAccessTokenExpires?: number;
    directusCredentialsUser?: boolean;
  }
}
