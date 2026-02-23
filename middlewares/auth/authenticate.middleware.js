import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new ApiError("No Tokens Provided!", 401);
  const token = authHeader.split(" ")[1];
  if (!token) return next(new ApiError("no token provided", 401));
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
