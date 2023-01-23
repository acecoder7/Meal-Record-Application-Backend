import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: String,
    required:true,
  },
  mealName: {
    type: String,
    required:true,
  },
  calories: {
    type: Number,
    default: 250
  },
});

export default mongoose.model("Meal", MealSchema);


