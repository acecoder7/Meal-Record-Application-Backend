import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createError } from "./error.js";
import cookie from "cookie";

export const verifyToken = (req,res,next)=>{
    const cookie = req.headers.cookie;
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

    jwt.verify(tokenWithoutPrefix, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(createError(403, "Token is not valid!"));
        req.user = user;
        next()
    });
};

export const isAuthenticated = async (req, res, next) => {
    try {
        const cookie = req.headers.cookie;
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
    
        // console.log(decoded._id);
        // console.log(decoded.id);

        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

  export const verifyUser = async (req,res,next)=>{

    const { token } = req.cookies;
    //const token = req.cookies.access_token;
    if(!token) {
        return next(createError(401, "Please login to access this resource"));
    }

    const decodedData = jwt.verify(token, process.env.JWT);
    req.user = await User.findById(decodedData.id);
    next();
    /*
    verifyToken(req,res, () => {
        console.log(req.user.id);
        console.log(req.params.id);
        if(req.user.id === req.params.id || req.user.isAdmin ){
            next();
        } else{
            return next(createError(403, "You are not authorized!"));
        }
    });
    */
};

export const verifyAdmin = (req,res,next)=>{
    verifyToken(req,res, () => {
        //console.log(req.user.isAdmin);
        if(req.user.isAdmin){
            next();
        } else{
            return next(createError(403, "You are not authorized!"));
        }
    });
};

export const sendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT);
    //options for cookie
    const options= {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 *60 *60 *1000 
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie("MealRecorder", token, options).json({
        success: true,
        user,
        token,
    });
};