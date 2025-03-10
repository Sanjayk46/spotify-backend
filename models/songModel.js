const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: String,
  artist: String,
  mp3Url: String, // Store URL after uploading to Cloudinary
});

module.exports = mongoose.model("Song", SongSchema);
