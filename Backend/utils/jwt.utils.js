const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Refresh Token
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// Verify Refresh Token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  // Generate tokens (use user.id for SQL, not user._id)
  const token = this.generateToken(user.id);
  const refreshToken = this.generateRefreshToken(user.id);

  // Get user data without password (toJSON handles this in model)
  const userData = user.toJSON();

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: userData
  });
};
