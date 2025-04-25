const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies.js");
const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(cors());
app.disable("x-powered-by");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello, friend /</h1>\n");
});

app.get("/movies", (req, res) => {
  const { title, year, genre } = req.query;
  let moviesJson = movies.movies;
  if (genre) {
    moviesJson = moviesJson = moviesJson.filter((movie) =>
      movie.Genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  if (title) {
    moviesJson = moviesJson.filter((movie) => {
      return movie.Title.toLowerCase === title.toLowerCase();
    });
  }
  if (year) {
    moviesJson = moviesJson.filter((movie) => {
      return movie.Year.toLowerCase() === year.toLowerCase();
    });
  }
  if (moviesJson.length === 0) return res.status(404).send("No movies found\n");

  res.send({ movies: moviesJson });
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.movies.find((movie) => movie.imdbID === id);
  if (!movie) return res.status(404).send("Movie not found\n");
  res.send(movie);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);
  if (result.error) {
    return res.status(400).send(result.error);
  }
  const newMovie = {
    imdbID: crypto.randomUUID(),
    Title: result.data.title,
    Year: result.data.year,
    Genre: result.data.genre,
  };
  movies.movies.push(newMovie);
  res.status(201).send(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.movies.find((movie) => movie.imdbID === id);
  if (!movie) return res.status(404).send("Movie not found\n");
  const result = validatePartialMovie(req.body);
  if (result.error) return res.status(400).send(result.error);
  const updatedMovie = {
    ...movie,
    Title: result.data.title,
    Year: result.data.year,
    Genre: result.data.genre,
  };
  movies.movies = movies.movies.map((movie) => {
    if (movie.imdbID === id) return updatedMovie;
    return movie;
  });
  res.send(updatedMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.movies.find((movie) => movie.imdbID === id);
  if (!movie) return res.status(404).send("Movie not found\n");
  movies.movies = movies.movies.filter((movie) => movie.imdbID !== id);
  res.send(movie);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
