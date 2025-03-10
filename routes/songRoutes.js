const express = require("express");
const axios = require("axios");
const getValidToken = require("../utils/spotifyToken"); // Import token handler
const router = express.Router();

// Fetch songs from Spotify API
const fetchSongs = async (query) => {
    try {
        const token = await getValidToken();
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.tracks.items.length) throw new Error("No songs found");

        return response.data.tracks.items.map(song => ({
            id: song.id,
            title: song.name,
            artist: song.artists[0].name,
            album: song.album.name,
            duration: song.duration_ms / 1000, // Convert ms to seconds
            preview: song.preview_url, // 30-second preview
            cover: song.album.images[1]?.url, // Medium-size image
            link: song.external_urls.spotify
        }));
    } catch (error) {
        console.error("❌ Error fetching songs:", error.message);
        return [];
    }
};

router.get("/songs", async (req, res) => {
    const query = req.query.q || "Bollywood";
    const songs = await fetchSongs(query);
    if (!songs.length) return res.status(404).json({ error: "No songs found" });
    res.json({ query, songs });
});

// Fetch album details
const fetchAlbumSongs = async (albumId) => {
    try {
        const token = await getValidToken();
        const url = `https://api.spotify.com/v1/albums/${albumId}`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            album: response.data.name,
            cover: response.data.images[1]?.url,
            songs: response.data.tracks.items.map(song => ({
                id: song.id,
                title: song.name,
                duration: song.duration_ms / 1000,
                preview: song.preview_url,
                link: song.external_urls.spotify
            }))
        };
    } catch (error) {
        console.error("❌ Error fetching album songs:", error.message);
        return null;
    }
};

router.get("/album", async (req, res) => {
    const albumId = req.query.id;
    if (!albumId) return res.status(400).json({ error: "Album ID is required" });
    const albumData = await fetchAlbumSongs(albumId);
    if (!albumData) return res.status(404).json({ error: "Album not found" });
    res.json(albumData);
});

// Fetch playlist details
const fetchPlaylistSongs = async (playlistId) => {
    try {
        const token = await getValidToken();
        const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            playlist: response.data.name,
            cover: response.data.images[0]?.url,
            songs: response.data.tracks.items.map(item => {
                const song = item.track;
                return {
                    id: song.id,
                    title: song.name,
                    artist: song.artists[0].name,
                    duration: song.duration_ms / 1000,
                    preview: song.preview_url,
                    link: song.external_urls.spotify
                };
            })
        };
    } catch (error) {
        console.error("❌ Error fetching playlist songs:", error.message);
        return null;
    }
};

router.get("/playlist", async (req, res) => {
    const playlistId = req.query.id;
    if (!playlistId) return res.status(400).json({ error: "Playlist ID is required" });
    const playlistData = await fetchPlaylistSongs(playlistId);
    if (!playlistData) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlistData);
});

// Fetch artist's top tracks
const fetchArtistSongs = async (artistId) => {
    try {
        const token = await getValidToken();
        const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            artist: response.data.tracks[0]?.artists[0].name,
            songs: response.data.tracks.map(song => ({
                id: song.id,
                title: song.name,
                duration: song.duration_ms / 1000,
                preview: song.preview_url,
                link: song.external_urls.spotify
            }))
        };
    } catch (error) {
        console.error("❌ Error fetching artist songs:", error.message);
        return null;
    }
};

router.get("/artist", async (req, res) => {
    const artistId = req.query.id;
    if (!artistId) return res.status(400).json({ error: "Artist ID is required" });
    const artistData = await fetchArtistSongs(artistId);
    if (!artistData) return res.status(404).json({ error: "Artist not found" });
    res.json(artistData);
});

module.exports = router;
