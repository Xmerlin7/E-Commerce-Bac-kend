import * as userService from "../services/user.service.js";

export const createOne = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(200).json({ message: "User Created successfully!", data: user });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getOne(req.params.id);
    res
      .status(200)
      .json({ message: "User retrieved successfully!", data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.update(req.params.id, req.body);
    res
      .status(200)
      .json({ message: "User updated successfully!", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAll(req.body);
    res
      .status(200)
      .json({ message: "User retrieved successfully!", data: users });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await userService.remove(req.params.id);
    res
      .status(200)
      .json({ message: "User deleted successfully!", data: deletedUser });
  } catch (error) {
    next(error);
  }
};
