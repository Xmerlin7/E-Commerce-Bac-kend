import { body, param } from "express-validator";

export const cartUserIdParamValidator = [
  param("userId").isMongoId().withMessage("userId must be a valid MongoId"),
];

export const addToCartValidator = [
  ...cartUserIdParamValidator,
  body("productId")
    .exists({ checkFalsy: true })
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("productId must be a valid MongoId"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantity must be an integer >= 1"),
];

export const deleteFromCartValidator = [
  ...cartUserIdParamValidator,
  body("productId")
    .exists({ checkFalsy: true })
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("productId must be a valid MongoId"),
];
