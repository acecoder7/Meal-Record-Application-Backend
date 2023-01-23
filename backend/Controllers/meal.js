import User from "../models/User.js";
import Meal from "../models/Meal.js";
import ApiFeatures from "../utils/apifeatures.js";


//Create Meal
export const createMeal = async (req,res) => {
    try{
      const newMealData = {
        time: req.body.time,
        user: req.user._id,
        mealName: req.body.mealName,
        calories: req.body.calories,
      };
  
      const meal = await Meal.create(newMealData);
  
      const user = await User.findById(req.user.id);
      //console.log(req.user.id);
      //console.log(meal._id);
  
      user.meals.unshift(meal._id);
  
      await user.save();
      res.status(201).json({
        success: true,
        message: "Meal Record created",
        meal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Delete Meal Record
export const deleteMeal = async (req,res) => {
    try {
        const meal = await Meal.findById(req.params.id);
    
        if (!meal) {
          return res.status(404).json({
            success: false,
            message: "Meal Record not found",
          });
        }
    
        if (meal.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }
    
        await meal.remove();
    
        const user = await User.findById(req.user._id);
    
        const index = user.meals.indexOf(req.params.id);
        user.meals.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Meal Record deleted",
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Delete Meal Record--admin
export const deleteMealAdmin = async (req,res) => {
    try {
        const meal = await Meal.findById(req.params.id);
    
        if (!meal) {
          return res.status(404).json({
            success: false,
            message: "Meal Record not found",
          });
        }
    
        await meal.remove();
    
        const user = await User.findById(req.user._id);
    
        const index = user.meals.indexOf(req.params.id);
        user.meals.splice(index, 1);
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Meal Record deleted by Admin",
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Update Meal Record 
export const updateMealDesc = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
    
        const { time, mealName, calories } = req.body;

        if (!meal) {
            return res.status(404).json({
              success: false,
              message: "Meal Record not found",
            });
        }
      
        if (meal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
              success: false,
              message: "Unauthorized",
            });
        }
    
        if (time) {
          meal.time = time;
        }
        if (mealName) {
          meal.mealName = mealName;
        }
        if (calories) {
            meal.calories = calories;
        }
    
        await meal.save();
        res.status(200).json({
          success: true,
          message: "Meal Record updated",
          meal
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Update Meal Record ---admin
export const updateMealDescAdmin = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
    
        const { time, mealName, calories } = req.body;

        if (!meal) {
            return res.status(404).json({
              success: false,
              message: "Meal Record not found",
            });
        }
    
        if (time) {
          meal.time = time;
        }
        if (mealName) {
          meal.mealName = mealName;
        }
        if (calories) {
            meal.calories = calories;
        }
    
        await meal.save();
        res.status(200).json({
          success: true,
          message: "Meal Record updated by Admin",
          meal
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};



//Get all Meal Records
export const getallMeal = async (req,res)=>{
    const apiFeatures = new ApiFeatures(Meal.find(),req.query).filter();
    try{
        const meal = await (apiFeatures.query).populate("user","email");;
        res.status(200).json(meal);
    } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
};




//txt models
export const modelDescription = async(req,res)=>{
    const txt = "the model consist of UserSchema and MealSchema: User schema have email(string- validator email), password{string}, isAdmin(boolean - true(admin), false(user)), meals(reference from meal schema), resetPasswordToken(string), resetPasswordExpire(date) ";      
    const txt2 = "MealSchema consist of time(string), mealName(string), calories(number with default 250, ceatedAt(time when the meal record is created), user(reference from UserSchema- shows which user create this meal record), ";

    res.status(200).json({
        txt, txt2
    })
}





