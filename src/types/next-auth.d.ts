import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      favoriteTeamId: number | null;
      favoriteTeamFlag: string | null;
      favoriteTeamShort: string | null;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    favoriteTeamId: number | null;
    favoriteTeamFlag: string | null;
    favoriteTeamShort: string | null;
    isAdmin: boolean;
  }
}
