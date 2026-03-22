import type { Request, Response } from "express";
import { pool } from "../db/mysql.js";

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM routes");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
};