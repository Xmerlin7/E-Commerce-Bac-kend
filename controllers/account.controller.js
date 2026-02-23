import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUser,
  getCurrentUser,
} from "../services/account.service.js";

export const register = async (req, res, next) => {
  try {
    let user = await registerUser(req.body);
    res.status(200).json({ message: "User Created successfully!", data: user });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const { refreshToken, accessToken, foundUserName } = await loginUser(
      req.body,
    );
    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict", //CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Hi ${foundUserName} U loggedIn successfully!`,
        token: accessToken,
      });
  } catch (error) {
    next(error);
  }
};
export const logout = async (req, res, next) => {
  try {
    await logoutUser(req);
    res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `logged Out successfully!`,
      });
  } catch (error) {
    next(error);
  }
};
export const refresh = async (req, res, next) => {
  try {
    const accessToken = await refreshUser(req);
    res.status(200).json({
      message: `U refreshed successfully!`,
      data: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
    let { name, role } = await getCurrentUser(req);
    return res
      .status(200)
      .json({ message: "Retrieved Successfully!", data: [name, role] });
  } catch (error) {
    next(error);
  }
};
