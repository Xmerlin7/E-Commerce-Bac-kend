import ApiError from "../../utils/ApiError.js";
export default (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new ApiError("Forbidden, U can't do that", 403);
    next();
  };
};
