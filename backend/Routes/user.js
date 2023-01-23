import express from "express";
import {
  register,
  whoami,
  login,
  logout,
  updatePassword,
  myProfile,
  getAllUsers,
  forgotPassword,
  resetPassword,
  getMyMeal,
  updateProfile,
  updateRole
} from "../controllers/user.js";
import { isAuthenticated, verifyAdmin, verifyUser } from "../utils/Auth.js";

const router = express.Router();

router.post("/register", register); //

router.post("/login", login);  //

router.get("/whoami", whoami);

router.get("/logout", logout);  //

router.put("/update/password", isAuthenticated, updatePassword);

router.put("/update/profile", isAuthenticated, updateProfile);

router.get("/me", isAuthenticated, myProfile);

router.get("/my/meals", isAuthenticated, getMyMeal);

router.get("/users", verifyAdmin , getAllUsers);

router.post("/forgot/password", forgotPassword);   //

router.put("/password/reset/:token", resetPassword);   //

router.put("/update/role/:id", verifyAdmin, updateRole);

export default router;