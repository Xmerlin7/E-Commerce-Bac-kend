import bcrypt from "bcryptjs";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";

export const create = async (data) => {
  let hashedPassword = await bcrypt.hash(data.password, 10);
  let userDTO = {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
  };
  let userCreated = await User.create(userDTO);
  return userCreated;
};
export const getAll = async () => {
  let users = await User.find();
  return users;
};

export const getOne = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError("User not found", 404);
  return user;
};

export const update = async (id, data) => {
  const updateData = { ...data };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  } else {
    delete updateData.password;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) throw new ApiError("User not found", 404);
  return updatedUser;
};

export const remove = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) throw new ApiError("User not found", 404);
  return deletedUser;
};
