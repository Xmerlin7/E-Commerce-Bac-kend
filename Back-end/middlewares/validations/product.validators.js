import { body, param } from "express-validator";

export const productIdParamValidator = [
  param("id").isMongoId().withMessage("id must be a valid MongoId"),
];

export const createProductValidator = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("name cannot be empty"),
  body("price")
    .exists()
    .withMessage("price is required")
    .isFloat({ min: 0 })
    .withMessage("price must be a number >= 0"),
  body("inStock")
    .optional()
    .isIn(["yes", "no"])
    .withMessage("inStock must be one of: yes, no"),
  body("categoryID")
    .exists({ checkFalsy: true })
    .withMessage("categoryID is required")
    .isMongoId()
    .withMessage("categoryID must be a valid MongoId"),
];
