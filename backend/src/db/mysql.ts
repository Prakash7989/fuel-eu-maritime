import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Environment variable ${key} is required`);
  return val;
}

export const pool = mysql.createPool({
  host: requiredEnv("DB_HOST"),
  user: requiredEnv("DB_USER"),
  password: requiredEnv("DB_PASSWORD"),
  database: requiredEnv("DB_NAME"),
});