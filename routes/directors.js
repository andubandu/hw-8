const express = require("express");
const Director = require("../mdl/directorSchema.js");
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const directors = await Director.find().populate('films');
    res.json(directors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

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

router.post('/new', async (req, res) => {
  try {
    const { name, birthYear, nationality } = req.body;

    if (!name || !birthYear || !nationality) {
      return res.status(400).json({ msg: "all fields are required" });
    }

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

router.put('/:id', async (req, res) => {
  try {
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

router.delete('/:id', async (req, res) => {
  try {
    const director = await Director.findByIdAndDelete(req.params.id);
    if (!director) {
      return res.status(404).json({ msg: "director not found" });
    }
    res.json({ msg: "director deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "internal server error" });
  }
});

module.exports = router;