const express = require("express");
const Film = require("../mdl/filmSchema.js");
const Director = require("../mdl/directorSchema.js");
const axios = require('axios');
const validateDirector = require('../middleware/validateDirector');
const filmSchema = require('../validation/filmValidation');

const router = express.Router();

const findPoster = async (title) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${title}&apikey=${process.env.OMDB_API}`);
    return response.data.Poster || "https://res.cloudinary.com/dyuabsnoo/image/upload/v1744385056/poster_u1gneg.png"; 
  } catch (error) {
    console.error("Error fetching poster:", error);
    return "https://res.cloudinary.com/dyuabsnoo/image/upload/v1744385056/poster_u1gneg.png";
  }
};

router.get('/', async (req, res) => {
  try {
    const { genre, year } = req.query;
    let query = {};
    
    if (genre) query.genre = genre;
    if (year) query.year = year;
    
    const films = await Film.find(query).populate('director');
    res.json(films);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

// Get film by ID
router.get('/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).populate('director');
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }
    res.json(film);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.post('/new', validateDirector, async (req, res) => {
  try {
    const { error } = filmSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { title, year, genre, img } = req.body;
    const directorId = req.headers['director-id'];

    const director = await Director.findById(directorId);
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }

    const poster = img || await findPoster(title);

    const film = new Film({
      title,
      year,
      genre,
      img: poster,
      director: directorId
    });

    const newFilm = await film.save();

    // Add film to director's films array
    director.films.push(newFilm._id);
    await director.save();

    // Populate director info before sending response
    await newFilm.populate('director');
    
    res.status(201).json(newFilm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (Object.keys(req.body).length > 0) {
      const { error } = filmSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ msg: error.details[0].message });
      }
    }

    const film = await Film.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('director');
    
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }
    
    res.json(film);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ msg: "film not found" });
    }

    const director = await Director.findById(film.director);
    if (director) {
      director.films = director.films.filter(filmId => filmId.toString() !== req.params.id);
      await director.save();
    }

    await Film.findByIdAndDelete(req.params.id);
    res.json({ msg: "film deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = router;