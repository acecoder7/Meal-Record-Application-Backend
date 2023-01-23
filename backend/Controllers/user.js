import User from "../models/User.js";
import Meal from "../models/Meal.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import ApiFeatures from "../utils/apifeatures.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { createError } from "../utils/error.js";
import bcrypt from "bcryptjs";


//Register
export const register = async (req, res, next) => {
    try{
        const salt= bcrypt.genSaltSync(7);
        const hash= bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            ...req.body,
            password: hash
        })
        await newUser.save()
        res.status(200).send("User has been created.")
    }catch(error){
        res.status(500).json({
        success: false,
        message: error.message,
        });
    }
};


// WhoAmI
export const whoami = async (req, res) => {
    try {
      const cookie = req.headers.cookie;
      //console.log(cookie);
      res.set('Access-Control-Allow-Origin', '*');
      //res.setHeader("Access-Control-Allow-Credentials", true);
      if (!cookie) {
        return res.status(401).json({
          success: false,
          message: "Please login first",
        });
      }
      const token = cookie
        .split(";")
        .find((c) => c.trim().startsWith("access_token="));

      //console.log(cookie);
  
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Who are you? You Degenerate at token 1",
        });
      }
  
      const tokenWithoutPrefix = token.split("=")[1];
      if (!tokenWithoutPrefix) {
        return res.status(401).json({
          success: false,
          error: "Who are you? You Degenerate at token 2",
        });
      }
  
      const decoded = await jwt.verify(
        tokenWithoutPrefix,
        process.env.JWT_SECRET
      );
  
      res.status(200).json({
        success: true,
        user: decoded,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Login
export const login = async (req, res, next) => {
    try{
        const user = await User.findOne({email: req.body.email});
        if(!user) return next(createError(404, "User not found!"));

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordCorrect) 
            return next(createError(400, "Wrong username or password!"));
        
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
        
        
        const { password, isAdmin, ...otherDetails } = user._doc;
        res.cookie("access_token", token, {
            httpOnly: true,
        }).status(200).json({ details:{password, isAdmin, ...otherDetails}});
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
          });
    }
};



//Logout
export const logout = async (req, res) => {
    try {
      res
        .status(200)
        .cookie("access_token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
        })
        .json({
          success: true,
          message: "Logged out",
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Update Profile
export const updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const { email } = req.body;
  
      if (email) {
        user.email = email;
      }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Profile Updated",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

//Update Password
export const updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
  
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide old and new password",
        });
      }
  
      const isMatch = await user.matchPassword(oldPassword);
  
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Old password",
        });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};


//My Profile
export const myProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate(
        "meals"
      );
  
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Get All Users
export const getAllUsers = async (req, res) => {
    const apiFeatures = new ApiFeatures(User.find(), req.query).search().filter();
    try {
      const users = await apiFeatures.query;
  
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Forget Password
export const forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      const resetPasswordToken = user.getResetPasswordToken();
  
      await user.save();
  
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/user/password/reset/${resetPasswordToken}`;
  
      const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;
  
      try {
        await sendEmail({
          email: user.email,
          subject: "Reset Password",
          message,
        });
  
        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email}`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
  
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};
  
//Reset Password
export const resetPassword = async (req, res, next) => {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Reset Password Token is invalid or has been expired",
        });
      }
  
      if (req.body.password !== req.body.confirmPassword) {
        return next(createError(400, "Password does not password"));
      }
  
      user.password = req.body.password;
  
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};



//Get My Meals
export const getMyMeal = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const meals = [];
  
      for (let i = 0; i < user.meals.length; i++) {
        const meal = await Meal.findById(user.meals[i]);
        meals.push(meal);
      }
  
      res.status(200).json({
        success: true,
        meals,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};




//Update roles --admin
export const updateRole = async (req,res,next)=>{
    try{
        //const updateEvent = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        const updateRole = await User.findById(req.params.id);

        if(!updateRole){
            return next(createError(404, "User not found with this Id"))
        };

        if(updateRole.isAdmin===req.body.isAdmin){
            return next(createError(400, `Already a ${updateRole.isAdmin}`));
        };
        updateRole.isAdmin = req.body.isAdmin;


        await updateRole.save({ validateBeforeSave: false});
        res.status(200).json(updateRole)
    } catch(err){
        next(err);
    }
};