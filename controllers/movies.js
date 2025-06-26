const MovieModel = require("../models/movie");

const getAll = async (req, res) => {
  const { title, year, genre } = req.query;
  const movies = await MovieModel.getAllMovies({ title, year, genre });
  res.send({ movies });
};

const getMovieById = async (req, res) => {
  const { id } = req.params;
  const movie = await MovieModel.getMovieById(id);
  if (movie instanceof Error) {
    return res.status(404).send(movie.message);
  }
  res.send(movie);
};

const createMovie = async (req, res) => {
  const newMovie = await MovieModel.create(req.body);
  if (newMovie instanceof Error) {
    return res.status(400).send(newMovie.message);
  }
  res.status(201).send(newMovie);
};

const updateMovie = async (req, res) => {
  const { id } = req.params;
  const updatedMovie = await MovieModel.update(id, req.body);
  if (updatedMovie instanceof Error) {
    return res.status(404).send(updatedMovie.message);
  }
  res.send(updatedMovie);
};

const deleteMovie = async (req, res) => {
  const { id } = req.params;
  const movie = await MovieModel.deleteMovie(id);
  if (movie instanceof Error) {
    return res.status(404).send(movie.message);
  }

  res.send(movie);
};

module.exports = {
  getAll,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
