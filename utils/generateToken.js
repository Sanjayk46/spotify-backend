const jwt = require('jsonwebtoken');

const generateToken = (req, res, userId) => {

    // Determine expiration time based on 'remember me' option
    const expiration = req.body.remember ? '365d' : '24h';

    // Generate JWT token with user ID and expiration
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: expiration
    });

    // Set the JWT token as an HTTP-only cookie with secure settings
    res.cookie('jwt', token, {
      httpOnly: true, // Prevent access by client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Allows cross-origin in production
      maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // Cookie expiration in milliseconds
    });
};

module.exports = { generateToken };