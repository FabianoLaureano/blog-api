import { Router } from "express";
import register from "../../controllers/v1/auth/register.ts";

const router = Router();

router.post("/register", register);

export default router;
