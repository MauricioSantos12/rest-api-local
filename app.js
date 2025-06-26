const express = require("express");
const app = express();
const { movieRouter } = require("./routes/movies.js");
const { crossMiddleware } = require("./middlewares/cors");
const PORT = process.env.PORT ?? 3000;
app.use(crossMiddleware);
app.disable("x-powered-by");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello, friend /</h1>\n");
});

app.use("/movies", movieRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
