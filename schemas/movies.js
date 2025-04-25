const z = require("zod");
const VALUES = ["Action", "Drama", "Comedy", "Horror", "Sci-Fi"];
const movieScheme = z.object({
  title: z.string(),
  year: z.string(),
  genre: z.array(z.enum(VALUES)),
});

const validateMovie = (data) => {
  const result = movieScheme.safeParse(data);
  if (!result.success) {
    return { error: result.error.format() };
  }
  return { data: result.data };
};

const validatePartialMovie = (data) => {
  return movieScheme.partial().safeParse(data);
};

module.exports = {
  validateMovie,
  validatePartialMovie,
};
