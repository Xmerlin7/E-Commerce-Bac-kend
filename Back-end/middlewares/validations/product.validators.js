import { body, param } from "express-validator";

export const productIdParamValidator = [
  param("id").isMongoId().withMessage("id must be a valid MongoId"),
];

export const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("title is required")
    .isString()
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("description is required")
    .isString()
    .trim(),

  body("price")
    .notEmpty()
    .withMessage("price is required")
    .isFloat({ min: 0 })
    .withMessage("price must be a number >= 0"),

  body("category")
    .notEmpty()
    .withMessage("category is required")
    .isMongoId()
    .withMessage("category must be a valid MongoId"),

  body("inStock")
    .optional()
    .isIn(["yes", "no"]),

  body("image")
    .optional()
    .isURL()
    .withMessage("image must be a valid URL"),
];