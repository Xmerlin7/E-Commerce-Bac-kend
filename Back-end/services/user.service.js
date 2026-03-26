import bcrypt from "bcryptjs";
import User from "../models/user.js";

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
