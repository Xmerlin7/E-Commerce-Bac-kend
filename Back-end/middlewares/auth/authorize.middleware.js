import ApiError from "../../utils/ApiError.js";
export default (...roles) => {
  return (req, res, next) => {
    if (!req.user) throw new ApiError("Unauthorized", 401);
    if (!roles.includes(req.user.role))
      throw new ApiError("Forbidden, U can't do that", 403);
    next();
  };
};
