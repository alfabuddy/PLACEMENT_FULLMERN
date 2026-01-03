import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/profile", protect, getUserProfile);
router.post("/logout", logoutUser);

export default router;
