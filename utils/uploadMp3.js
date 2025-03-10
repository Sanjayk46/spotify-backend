const axios = require("axios");
const cloudinary = require("./cloudconfig");
const Song = require("../models/songModel");

const fetchAndSaveMP3 = async (songId) => {
  try {
    console.log("Fetching song details for ID:", songId);

    // Fetch MP3 URL
    const response = await axios.get(`https://saavn.dev/api/songs?id=${songId}`);
    
    if (!response.data.success || !response.data.data[0]?.downloadUrl[4]?.url) {
      throw new Error("MP3 URL not found");
    }

    const songData = response.data.data[0];
    const mp3Url = songData.downloadUrl[4].url;
    console.log("MP3 URL:", mp3Url); // Debug

    // Download MP3 file
    const mp3Response = await axios({
      url: mp3Url,
      method: "GET",
      responseType: "stream",
    });

    console.log("Downloading MP3...");

    // Upload to Cloudinary
    const cloudinaryUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "video", format: "mp3" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(new Error("Failed to upload MP3 to Cloudinary"));
          }
          console.log("Cloudinary Upload Success:", result.secure_url);
          resolve(result.secure_url);
        }
      );

      mp3Response.data.pipe(uploadStream);
    });

    // Save to MongoDB
    console.log("Saving song details to MongoDB...");
    const newSong = await Song.create({
      title: songData.name,
      artist: songData.primaryArtists,
      mp3Url: cloudinaryUpload,
    });

    console.log("Saved Successfully:", newSong);
    return newSong;

  } catch (error) {
    console.error("Error:", error.message);
    throw new Error("Failed to save MP3");
  }
};

module.exports = fetchAndSaveMP3;
