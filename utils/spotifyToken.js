const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

let accessToken = null;
let tokenExpiry = 0; // Expiration timestamp

// Function to fetch a new Spotify Access Token
const getSpotifyToken = async () => {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
            },
            body: "grant_type=client_credentials",
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to get token");

        accessToken = data.access_token;
        tokenExpiry = Date.now() + data.expires_in * 1000; // Convert expiry time to milliseconds

        console.log("✅ New Spotify Token:", accessToken);
        console.log("⏳ Token expires at:", new Date(tokenExpiry).toLocaleTimeString());

        return accessToken;
    } catch (error) {
        console.error("❌ Error fetching Spotify token:", error.message);
        return null;
    }
};

// Function to get a valid token (refresh if expired)
const getValidToken = async () => {
    if (!accessToken || Date.now() >= tokenExpiry) {
        console.log("🔄 Token expired, fetching a new one...");
        return await getSpotifyToken();
    }
    return accessToken;
};

// Auto-refresh token every 59 minutes
const startTokenAutoRefresh = async () => {
    await getSpotifyToken(); // Get the first token

    setInterval(async () => {
        await getSpotifyToken();
    }, 1000 * 60 * 59); // Refresh every 59 minutes (Spotify tokens last 60 mins)
};

// Start the token auto-refresh process
startTokenAutoRefresh();

module.exports = getValidToken;
