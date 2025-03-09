const express = require("express");
const axios = require("axios");

const router = express.Router();

// Fetch songs function
const fetchSongs = async (query) => {
    try {
        const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        // Validate response structure
        if (!response.data.success || !response.data.data || !response.data.data.results || response.data.data.results.length === 0) {
            throw new Error("No songs found");
        }
        return response.data.data.results.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.primaryArtists,
            album: song.album?.name || "Unknown Album",
            releaseYear: song.year || "Unknown Year",
            language: song.language || "Unknown",
            duration: song.duration,
            playCount: song.playCount,
            url: song.url,
            cover: song.album?.url || "No cover available",
        }));

    } catch (error) {
        console.error("Error fetching songs:", error.message);
        return [];
    }
};

// API Route: Get songs based on query
router.get("/songs", async (req, res) => {
    const category = req.query.category || "Bollywood";  // Default category

    const songs = await fetchSongs(category);

    if (songs.length === 0) {
        return res.status(500).json({ error: "Error fetching songs" });
    }
    res.json({ category, songs });
});
const searchSongs = async (query) => {
    try {
        console.log(`🔍 Searching for: ${query}`);

        // Encode query properly
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `https://saavn.dev/api/search/songs?query=${encodedQuery}`;

        // Make the API request
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        // Validate response structure
        if (!response.data.success || !response.data.data?.results?.length) {
            throw new Error("No songs found");
        }

        // Extract required details
        return response.data.data.results.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.artists?.primary?.map(a => a.name).join(", ") || "Unknown Artist",
            album: song.album?.name || "Unknown Album",
            releaseYear: song.year || "Unknown Year",
            duration: song.duration,
            playCount: song.playCount,
            url: song.url,
            cover: song.album?.url || "No cover available",
        }));

    } catch (error) {
        console.error("❌ Error searching songs:", error.message);
        return [];
    }
};

// API Route: Search songs
router.get("/search", async (req, res) => {
    const query = req.query.q; // Get search query

    if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const songs = await searchSongs(query);

    if (songs.length === 0) {
        return res.status(404).json({ error: "No songs found" });
    }

    res.json({ query, songs });
});
const fetchAlbumSongs = async (albumId) => {
    try {
        console.log(`🔍 Fetching album with ID: ${albumId}`);

        // API Request
        const url = `https://saavn.dev/api/albums?id=${albumId}`;
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        // Debugging: Log API response
        console.log("🔄 API Response:", JSON.stringify(response.data, null, 2));

        // Validate response
        if (!response.data.success || !response.data.data || !response.data.data.songs.length) {
            throw new Error("No songs found for this album");
        }

        // Extract album details
        const albumInfo = response.data.data;
        const songs = albumInfo.songs.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.primaryArtists,
            duration: song.duration,
            playCount: song.playCount,
            url: song.url,
            cover: albumInfo.image[2]?.url || "No cover available",
        }));

        return { album: albumInfo.name, songs };

    } catch (error) {
        console.error("❌ Error fetching album songs:", error.message);
        return null;
    }
};

// API Route: Get songs from an album
router.get("/album", async (req, res) => {
    const albumId = req.query.id; // Get album ID from request query

    if (!albumId) {
        return res.status(400).json({ error: "Album ID parameter 'id' is required" });
    }

    const albumData = await fetchAlbumSongs(albumId);

    if (!albumData) {
        return res.status(404).json({ error: "Album not found or no songs available" });
    }

    res.json(albumData);
});

const fetchplaylistSongs = async (playlistId) => {
    try {
        console.log(`🔍 Fetching album with ID: ${playlistId}`);

        // API Request
        const url = `https://saavn.dev/api/playlists?id=${playlistId}`;
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        // Debugging: Log API response
        console.log("🔄 API Response:", JSON.stringify(response.data, null, 2));

        // Validate response
        if (!response.data.success || !response.data.data || !response.data.data.songs.length) {
            throw new Error("No songs found for this album");
        }

        // Extract album details
        const albumInfo = response.data.data;
        const songs = albumInfo.songs.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.primaryArtists,
            duration: song.duration,
            playCount: song.playCount,
            url: song.url,
            cover: albumInfo.image[2]?.url || "No cover available",
        }));

        return { album: albumInfo.name, songs };

    } catch (error) {
        console.error("❌ Error fetching album songs:", error.message);
        return null;
    }
};

// API Route: Get songs from an album
router.get("/playlist", async (req, res) => {
    const playlistId = req.query.playlistId; // Get album ID from request query

    if (!playlistId) {
        return res.status(400).json({ error: "Album ID parameter 'id' is required" });
    }

    const playlistData = await fetchplaylistSongs(playlistId);

    if (!playlistData) {
        return res.status(404).json({ error: "Album not found or no songs available" });
    }

    res.json(playlistData);
});

const fetchArtistSongs = async (artistName) => {
    try {
        console.log(`🔍 Searching for songs by: ${artistName}`);

        // Search API for songs by artist
        const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(artistName)}&limit=20`;
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        if (!response.data.success || !response.data.data.results.length) {
            throw new Error("No songs found for this artist");
        }

        const songs = response.data.data.results.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.primaryArtists,
            duration: song.duration,
            playCount: song.playCount,
            url: song.url,
            cover: song.image?.[2]?.url || "No cover available"
        }));

        return { artist: artistName, songs };
    } catch (error) {
        console.error("❌ Error fetching artist songs:", error.message);
        return null;
    }
};

router.get('/artist', async (req, res) => {
    try {
        const artistId = req.query.artistId;
        console.log("🎵 Received Artist ID:", artistId);

        if (!artistId) {
            return res.status(400).json({ error: "Artist ID parameter 'artistId' is required" });
        }

        // Fetch artist details
        const artistUrl = `https://saavn.dev/api/artists?id=${artistId}`;
        const artistResponse = await axios.get(artistUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        if (!artistResponse.data.success || !artistResponse.data.data) {
            throw new Error("Artist not found");
        }

        const artistInfo = artistResponse.data.data;
        const artistName = artistInfo.name;

        // Fetch songs using artist name
        const artistData = await fetchArtistSongs(artistName);
        if (!artistData) {
            return res.status(404).json({ error: "No songs available for this artist" });
        }

        res.json(artistData);
    } catch (error) {
        console.error("❌ Internal server error:", error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});



module.exports = router;