import { validationResult } from "express-validator";
import ApiError from "../../utils/ApiError.js";


export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError("Validation Error", 400);
  }
  next();
};
