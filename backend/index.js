import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js";
import mealRouter from "./routes/meal.js";

const app = express();
dotenv.config();

mongoose.set("strictQuery", false);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("MongoDB connected");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/meal", mealRouter);

app.listen(process.env.PORT, () => {
  connect();
  console.log("Listening PORT...");
});