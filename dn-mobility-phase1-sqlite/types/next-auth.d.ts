import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
      role?: "ADMIN" | "ADMIN_IT" | "CLIENT" | "CONVOYEUR";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "ADMIN_IT" | "CLIENT" | "CONVOYEUR";
    name?: string;
  }
}
