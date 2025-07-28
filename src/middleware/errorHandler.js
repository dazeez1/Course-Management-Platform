const errorHandler = (error, req, res, next) => {
  console.error("Error occurred:", error);

  // Sequelize validation errors
  if (error.name === "SequelizeValidationError") {
    const validationErrors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return res.status(400).json({
      error: "Validation failed",
      message: "Please check your input data",
      details: validationErrors,
    });
  }

  // Sequelize unique constraint errors
  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0].path;
    return res.status(409).json({
      error: "Duplicate entry",
      message: `${field} already exists`,
      field: field,
    });
  }

  // Sequelize foreign key constraint errors
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      error: "Invalid reference",
      message: "The referenced record does not exist",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is invalid",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "Your session has expired. Please login again",
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred";

  res.status(statusCode).json({
    error: "Server error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
