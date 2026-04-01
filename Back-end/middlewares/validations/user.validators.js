import { body, param } from "express-validator";

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

export const userIdValidator = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

export const updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user id"),
  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("name must be 3-50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be valid")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("role must be one of: user, admin"),
];

export const deleteUserValidator = [
  param("id").isMongoId().withMessage("Invalid user id"),
];
