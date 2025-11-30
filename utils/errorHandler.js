//Error handler
module.exports.errorHandler = (err, req, res) => {
  const { statusCode = 500 } = err;

  // Generic error
  if (!err.message) err.message = "Oh No, something went wrong.";

  res.status(statusCode).render("policy/error", {
    err,
    title: "Error - Something Went Wrong",
    page: "error",
  });
};
