require("dotenv").config();
const mysql = require("mysql2/promise");

const defaultConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "moviesdb",
  port: 3306,
};

const config = process.env.uri_db ?? defaultConfig;

const getAllMovies = async ({ genre, title, year }) => {
  let moviesToReturn = [];
  const connection = await mysql.createConnection(config);
  if (genre) {
    const lowerCaseGenre = genre.toLowerCase();
    const [genres] = await connection.query(
      "SELECT id, name FROM genre WHERE LOWER(name) = ?",
      [lowerCaseGenre]
    );

    if (genres.length === 0) {
      return [];
    }
    const [{ id }] = genres;
    const moviesGenres = await connection.query(
      "SELECT BIN_TO_UUID(movie_id), genre_id FROM movie_genres WHERE genre_id = ?",
      [id]
    );

    const movieIds = moviesGenres[0].map((movie) => {
      return movie["BIN_TO_UUID(movie_id)"];
    });
    const result = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE BIN_TO_UUID(id) IN (?)",
      [movieIds]
    );
    moviesToReturn = [...result[0], ...moviesToReturn];
  }
  if (title) {
    const lowerCaseTitle = title.toLowerCase();
    const result = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE LOWER(title) = ?",
      [lowerCaseTitle]
    );
    moviesToReturn = [...result[0], ...moviesToReturn];
  }
  if (year) {
    const result = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE year = ?",
      [year]
    );
    moviesToReturn = [...result[0], ...moviesToReturn];
  }

  if (!genre && !title && !year) {
    const result = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie"
    );
    moviesToReturn = [...result[0], ...moviesToReturn];
  }
  // filter duplicated items
  moviesToReturn = [
    ...new Map(
      moviesToReturn.map((movie) => [movie["BIN_TO_UUID(id)"], movie])
    ).values(),
  ];

  return moviesToReturn;
};

const getMovieById = async (id) => {
  const connection = await mysql.createConnection(config);
  const result = await connection.query(
    "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?)",
    [id]
  );
  const genres = await connection.query(
    "SELECT id, name FROM genre WHERE id IN (SELECT genre_id FROM movie_genres WHERE movie_id = UUID_TO_BIN(?))",
    [id]
  );

  return {
    ...result[0][0],
    genres: genres[0],
  };
};

const create = async (body) => {
  const connection = await mysql.createConnection(config);
  const [uuidResult] = await connection.query("SELECT UUID() as uuid");
  const [{ uuid }] = uuidResult;

  try {
    await connection.query(
      "INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)",
      [
        uuid,
        body.title,
        body.year,
        body.director,
        body.duration,
        body.poster,
        body.rate,
      ]
    );
  } catch (error) {
    console.log({ error });
  }
  const [movie] = await connection.query(
    "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?)",
    [uuid]
  );

  const genres = await connection.query(
    "SELECT id, name FROM genre WHERE LOWER(name) IN (?)",
    [body.genre.map((genre) => genre.toLowerCase())]
  );
  if (genres.length === 0) {
    console.log("No genres found");
    return movie;
  }
  genres[0].forEach(async (genre) => {
    await connection.query(
      "INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)",
      [uuid, genre.id]
    );
  });
  return movie;
  // return result;
};

const update = async (id, body) => {
  const connection = await mysql.createConnection(config);
  let query = "UPDATE movie SET ";
  const values = [];
  let hasValues = false;
  if (body.title) {
    query += "title = ?";
    values.push(body.title);
    hasValues = true;
  }
  if (body.year) {
    query += hasValues ? ", year = ?" : "year = ?";
    values.push(body.year);
    hasValues = true;
  }
  if (body.director) {
    query += hasValues ? ", director = ?" : "director = ?";
    values.push(body.director);
    hasValues = true;
  }
  if (body.duration) {
    query += hasValues ? ", duration = ?" : "duration = ?";
    values.push(body.duration);
    hasValues = true;
  }
  if (body.poster) {
    query += hasValues ? ", poster = ?" : "poster = ?";
    values.push(body.poster);
    hasValues = true;
  }
  if (body.rate) {
    query += hasValues ? ", rate = ?" : "rate = ?";
    values.push(body.rate);
    hasValues = true;
  }
  query += " WHERE id = UUID_TO_BIN(?)";
  values.push(id);
  try {
    await connection.query(query, values);
    const [movie] = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?)",
      [id]
    );
    return movie;
  } catch (error) {
    console.log({ error });
    return [];
  }
};

const deleteMovie = async (id) => {
  const connection = await mysql.createConnection(config);
  try {
    const [movie] = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?)",
      [id]
    );
    await connection.query("DELETE FROM movie WHERE id = UUID_TO_BIN(?)", [id]);
    return movie;
  } catch (error) {
    console.log({ error });
    return [];
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  create,
  update,
  deleteMovie,
};
