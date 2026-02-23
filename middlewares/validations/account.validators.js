import { body, cookie } from "express-validator";

export const registerValidator = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("name must be 3-50 characters"),
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid")
    .normalizeEmail(),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("role must be one of: user, admin"),
];

export const loginValidator = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid")
    .normalizeEmail(),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("password is required")
    .isString()
    .withMessage("password must be a string"),
];

export const refreshValidator = [
  cookie("refreshToken")
    .exists({ checkFalsy: true })
    .withMessage("refreshToken cookie is required"),
];

export const logoutValidator = [
  cookie("refreshToken")
    .exists({ checkFalsy: true })
    .withMessage("refreshToken cookie is required"),
];
