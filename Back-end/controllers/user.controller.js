import * as userService from "../services/user.service.js";

export const createOne = async (req, res, next) => {
  try {
    let user = await userService.create(req.body);
    res.status(200).json({ message: "User Created successfully!", data: user });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
export const getAllUsers = async (req, res, next) => {
  try {
    let users = await userService.getAll(req.body);
    res
      .status(200)
      .json({ message: "User retrieved successfully!", data: users });
  } catch (error) {
    next(error);
  }
};
