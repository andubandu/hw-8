const express = require("express");
const Director = require("../mdl/directorSchema.js");
const Film = require("../mdl/filmSchema.js");
const directorSchema = require('../validation/directorValidation');
const router = express.Router();

// Get all directors with their films
router.get('/', async (req, res) => {
  try {
    const directors = await Director.find().populate('films');
    res.json(directors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

// Get director by ID
router.get('/:id', async (req, res) => {
  try {
    const director = await Director.findById(req.params.id).populate('films');
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }
    res.json(director);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

// Create new director
router.post('/new', async (req, res) => {
  try {
    const { error } = directorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { name, birthYear, nationality } = req.body;
    const director = new Director({
      name,
      birthYear,
      nationality
    });

    const newDirector = await director.save();
    res.status(201).json(newDirector);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

// Update director
router.put('/:id', async (req, res) => {
  try {
    if (Object.keys(req.body).length > 0) {
      const { error } = directorSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ msg: error.details[0].message });
      }
    }

    const director = await Director.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('films');
    
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }
    
    res.json(director);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

// Delete director and their films
router.delete('/:id', async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }

    // Delete all films by this director
    await Film.deleteMany({ director: director._id });

    // Delete the director
    await Director.findByIdAndDelete(req.params.id);
    
    res.json({ msg: "director and associated films deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = router;