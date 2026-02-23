import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { create } from "./user.service.js";
import ApiError from "../utils/ApiError.js";
import RefreshTokenModel from "../models/tokens.js";
import Tokens from "../models/tokens.js";

export const getCurrentUser = async (req) => {
  const currentUserId = req.user.userId;
  const currentUser = await User.findById(currentUserId);
  console.log(currentUser);
  return currentUser
};


export const registerUser = async (data) => {
  const newUser = await create(data);
  return newUser;
};
export const loginUser = async (data) => {
  const { email, password } = data;

  const foundUser = await User.findOne({ email });

  if (!foundUser) throw new ApiError("Invalid email or password", 400);

  const isValid = await bcrypt.compare(password, foundUser.password);

  if (!isValid) throw new ApiError("Invalid email or password", 400);
  const accessToken = await jwt.sign(
    { userId: foundUser._id, role: foundUser.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = await jwt.sign(
    {
      userId: foundUser._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
  let hashedToken = await bcrypt.hash(refreshToken, 10);
  hashedToken = hashedToken.toString();
  await RefreshTokenModel.create({
    user: foundUser._id,
    token: hashedToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return { refreshToken, accessToken, foundUserName: foundUser.name };
};
export const logoutUser = async (req) => {
  const cookieRefreshToken = req.cookies.refreshToken;
  if (!cookieRefreshToken) throw new ApiError("Refresh Token Required!", 400);

  let payload = jwt.verify(
    cookieRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const { userId } = payload;
  const allUserRefTokens = await Tokens.find({ user: userId });

  const comparedBooleanTokens = await Promise.all(
    allUserRefTokens.map((t) => bcrypt.compare(cookieRefreshToken, t.token)),
  );
  const currentTokenIndex = comparedBooleanTokens.findIndex((t) => t == true);
  if (currentTokenIndex === -1)
    return new ApiError("Refresh token not found", 401);

  await Tokens.findByIdAndDelete(allUserRefTokens[currentTokenIndex]._id);
};
export const refreshUser = async (req) => {
  const cookieRefreshToken = req.cookies.refreshToken;
  if (!cookieRefreshToken) throw new ApiError("Refresh Token Required!", 400);

  let payload = jwt.verify(
    cookieRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const { userId } = payload;

  const newAccessToken = jwt.sign(
    {
      userId,
      role: payload.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
  return newAccessToken;
};
