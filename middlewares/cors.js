const cors = require("cors");

const acceptedOrigins = ["http://localhost:3000", "http://localhost:8000"];

const crossMiddleware = cors();

module.exports = {
  crossMiddleware,
};
