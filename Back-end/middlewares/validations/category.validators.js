import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("name must be 2-50 characters"),
];

export const categoryIdParamValidator = [
  param("id").isMongoId().withMessage("id must be a valid MongoId"),
];
