/**
 * IGDB Token Manager
 * Automatically generates and caches access tokens from Client ID/Secret
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TokenManager {
  constructor() {
    this.tokenCachePath = path.join(__dirname, '../../storage/.igdb_token_cache.json');
    this.cachedToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get valid access token (from cache or generate new)
   * @param {string} clientId - Twitch Client ID
   * @param {string} clientSecret - Twitch Client Secret
   * @returns {Promise<string>} - Valid access token
   */
  async getAccessToken(clientId, clientSecret) {
    // Check if we have a valid cached token
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    // Try to load from file cache
    const cachedData = this.loadTokenFromCache();
    if (cachedData && Date.now() < cachedData.expiry) {
      this.cachedToken = cachedData.token;
      this.tokenExpiry = cachedData.expiry;
      console.log('✓ Using cached IGDB access token');
      return this.cachedToken;
    }

    // Generate new token
    console.log('Generating new IGDB access token...');
    const token = await this.generateToken(clientId, clientSecret);

    return token;
  }

  /**
   * Generate new access token from Twitch OAuth
   * @param {string} clientId - Twitch Client ID
   * @param {string} clientSecret - Twitch Client Secret
   * @returns {Promise<string>} - Access token
   */
  async generateToken(clientId, clientSecret) {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
          }
        }
      );

      const { access_token, expires_in } = response.data;

      // Cache token (with 1 hour buffer before expiry)
      const expiryTime = Date.now() + ((expires_in - 3600) * 1000);

      this.cachedToken = access_token;
      this.tokenExpiry = expiryTime;

      // Save to file cache
      this.saveTokenToCache(access_token, expiryTime);

      const daysValid = Math.floor(expires_in / 86400);
      console.log(`✓ New IGDB access token generated (valid for ${daysValid} days)`);

      return access_token;

    } catch (error) {
      console.error('Failed to generate IGDB access token:', error.response?.data || error.message);
      throw new Error('Failed to generate IGDB access token. Check your Client ID and Secret.');
    }
  }

  /**
   * Load token from file cache
   * @returns {object|null} - Cached token data or null
   */
  loadTokenFromCache() {
    try {
      if (fs.existsSync(this.tokenCachePath)) {
        const data = fs.readFileSync(this.tokenCachePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load token cache:', error.message);
    }
    return null;
  }

  /**
   * Save token to file cache
   * @param {string} token - Access token
   * @param {number} expiry - Expiry timestamp
   */
  saveTokenToCache(token, expiry) {
    try {
      const cacheDir = path.dirname(this.tokenCachePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(
        this.tokenCachePath,
        JSON.stringify({ token, expiry }, null, 2)
      );
    } catch (error) {
      console.warn('Failed to save token cache:', error.message);
    }
  }

  /**
   * Clear token cache
   */
  clearCache() {
    this.cachedToken = null;
    this.tokenExpiry = null;

    try {
      if (fs.existsSync(this.tokenCachePath)) {
        fs.unlinkSync(this.tokenCachePath);
      }
    } catch (error) {
      console.warn('Failed to clear token cache:', error.message);
    }
  }
}

// Export singleton
module.exports = new TokenManager();
