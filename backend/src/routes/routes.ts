import express from "express";
import { getRoutes } from "../controllers/routesController.js";

const router = express.Router();

router.get("/", getRoutes);

export default router;