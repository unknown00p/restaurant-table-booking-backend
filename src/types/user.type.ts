import { HydratedDocument } from "mongoose";
import { Request } from "express";

export interface UserSchemaTypes {
  email: string;
  password: string;
  userName: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
}

export type authorizedUser = Request & {
  user?: HydratedDocument<UserSchemaTypes>;
  cookies: { [key: string]: string };
};