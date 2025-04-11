const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthYear: { type: String, required: true },
  nationality: { type: String, required: true },
  films: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }]
});

const Director = mongoose.model('Director', directorSchema);

module.exports = Director;