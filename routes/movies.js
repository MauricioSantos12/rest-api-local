const { Router } = require("express");
const movieController = require("../controllers/movies");
const movieRouter = Router();

movieRouter.get("/", movieController.getAll);
movieRouter.post("/", movieController.createMovie);

movieRouter.get("/:id", movieController.getMovieById);
movieRouter.patch("/:id", movieController.updateMovie);
movieRouter.delete("/:id", movieController.deleteMovie);

module.exports = {
  movieRouter,
};
