import { body } from "express-validator";

export const createUserValidator = [
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
