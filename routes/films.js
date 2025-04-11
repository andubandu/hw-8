const express = require("express");
const Film = require("../mdl/filmSchema.js");
const Director = require("../mdl/directorSchema.js");
const axios = require('axios');

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
    const films = await Film.find().populate('director');
    res.json(films);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

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

router.post('/new', async (req, res) => {
  try {
    const { title, year, genre, img } = req.body;
    const directorId = req.headers['director-id'];

    if (!title || !year || !genre || !directorId) {
      return res.status(400).json({ msg: "all fields and director-id header are required" });
    }

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

    director.films.push(newFilm._id);
    await director.save();

    await newFilm.populate('director');
    
    res.status(201).json(newFilm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
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