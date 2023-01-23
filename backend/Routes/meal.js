import express from "express";
import { createMeal, deleteMeal, updateMealDesc, getallMeal, deleteMealAdmin, updateMealDescAdmin , modelDescription} from "../controllers/meal.js";
import { isAuthenticated, verifyAdmin, verifyUser } from "../utils/Auth.js";

const router = express.Router();

router.post("/upload", isAuthenticated, createMeal);

router.put("/:id", isAuthenticated, updateMealDesc);

router.delete("/:id", isAuthenticated, deleteMeal);

router.put("/admin/:id", verifyAdmin, updateMealDescAdmin);

router.delete("/admin/:id", verifyAdmin, deleteMealAdmin);

router.get("/meals", verifyAdmin, getallMeal);

router.get("/descriptionOfModel", modelDescription);


export default router