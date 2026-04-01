export default (err, req, res, next) => {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "jwt expired",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (err.name === "ValidationError") {
    let errMsgs = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");
    return res.status(400).json({
      message: errMsgs,
    });
  }
  if (err.code === 11000) {
    console.log(err.keyValue);
    const message = Object.entries(err.keyValue).map(
      ([key, value]) => `${key} ${value} already exists`,
    );
    return res.status(400).json(message);
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error!",
  });
};
