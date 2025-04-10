import dotenv from "dotenv";

// Load environment variables early
dotenv.config();

// Export variables so they are available everywhere
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL as string;
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS as string;