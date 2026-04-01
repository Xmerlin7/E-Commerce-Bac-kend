import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { create } from "./user.service.js";
import ApiError from "../utils/ApiError.js";
import RefreshTokenModel from "../models/tokens.js";

// ========== GET CURRENT USER ==========
export const getCurrentUser = async (req) => {
  const currentUserId = req.user.userId;
  const currentUser = await User.findById(currentUserId);
  console.log(currentUser);
  return currentUser;
};

//! ========== REGISTER USER ==========
export const registerUser = async (data) => {
  const newUser = await create(data);
  return newUser;
};

//! ========== LOGIN USER ==========
export const loginUser = async (data) => {
  const { email, password, forceLogin = false } = data;

  const foundUser = await User.findOne({ email });

  if (!foundUser) throw new ApiError("Invalid email or password", 400);
  //No Timing Attacks as compare sends data in constant time
  const isValid = await bcrypt.compare(password, foundUser.password);

  if (!isValid) throw new ApiError("Invalid email or password", 400);

  const existingSession = await RefreshTokenModel.findOne({
    user: foundUser._id,
  });
  if (existingSession?.expiresAt && existingSession.expiresAt > new Date()) {
    if (forceLogin) {
      await RefreshTokenModel.deleteOne({ _id: existingSession._id });
    } else {
      throw new ApiError(
        "You are already logged in. Please logout first.",
        409,
      );
    }
  }
  if (existingSession) {
    await RefreshTokenModel.deleteOne({ _id: existingSession._id });
  }

  const accessToken = jwt.sign(
    { userId: foundUser._id, role: foundUser.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    {
      userId: foundUser._id,
      role: foundUser.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
  let hashedToken = await bcrypt.hash(refreshToken, 10);
  hashedToken = hashedToken.toString();
  await RefreshTokenModel.findOneAndUpdate(
    { user: foundUser._id }, // 1. "Find" criteria
    {
      // 2. "Update" data
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }, // 3. Options
  );
  return {
    refreshToken,
    accessToken,
    user: {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    },
  };
};

//! ========== LOGOUT USER ==========
export const logoutUser = async (req) => {
  const cookieRefreshToken = req.cookies.refreshToken;
  if (!cookieRefreshToken) throw new ApiError("Refresh Token Required!", 400);

  let payload = jwt.verify(
    cookieRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const { userId } = payload;

  await RefreshTokenModel.findOneAndDelete({ user: userId });
};

//! ========== REFRESH TOKEN ==========
export const refreshUser = async (req) => {
  const cookieRefreshToken = req.cookies.refreshToken;
  if (!cookieRefreshToken) throw new ApiError("Refresh Token Required!", 400);

  let payload = jwt.verify(
    cookieRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const { userId } = payload;
  let storedRecord = await RefreshTokenModel.findOne({ user: userId });
  if (!storedRecord) throw new ApiError("Session expired or logged out", 401);

  let isValid = await bcrypt.compare(cookieRefreshToken, storedRecord.token);
  if (!isValid)
    throw new ApiError("U Are Only Allowed To login from one Device", 401);

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
