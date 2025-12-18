// backend/middlewares/auth.js
import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import { User } from "../models/userSchema.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    /* console.log(decoded); 
      eg. { id: '66ead81818c14b0bcbaf43bb', iat: 1726685745, exp: 1727290545 }
      */
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorHandler("User not found.", 401));
    }
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token.", 401));
  }

  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource.`
        )
      );
    }
    next();
  };
};
