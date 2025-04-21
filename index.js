require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const filmsRoute = require('./routes/films.js');
const directorsRoute = require('./routes/directors.js');
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/films', filmsRoute);
app.use('/directors', directorsRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Something broke!" });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});