import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      directusAccessToken?: string;
      directusRefreshToken?: string;
    };
  }

  interface User {
    directusAccessToken?: string;
    directusRefreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    directusAccessToken?: string;
    directusRefreshToken?: string;
    directusUserId?: string;
  }
}
