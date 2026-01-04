/**
 * Metadata Service
 * Fetches game metadata from IGDB API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const { IGDB_PLATFORM_IDS } = require('../config/constants');
const { ensureDirectoryExists } = require('../utils/fileHelper');

/**
 * IGDB API Client
 */
class MetadataService {
  constructor() {
    this.clientId = config.IGDB_CLIENT_ID;
    this.accessToken = config.IGDB_ACCESS_TOKEN;
    this.baseUrl = 'https://api.igdb.com/v4';
    this.enabled = !!(this.clientId && this.accessToken);

    if (!this.enabled) {
      console.warn('⚠ IGDB API credentials not configured. Metadata fetching disabled.');
    }
  }

  /**
   * Check if metadata service is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Search for game by title and platform
   * @param {string} title - Game title
   * @param {string} platformShortName - Platform short name (e.g., 'nes')
   * @returns {Promise<Array>} - Search results
   */
  async searchGame(title, platformShortName) {
    if (!this.enabled) {
      throw new Error('IGDB API not configured');
    }

    const platformId = IGDB_PLATFORM_IDS[platformShortName];

    const query = `
      search "${title}";
      fields name, summary, cover.url, first_release_date,
             involved_companies.company.name, genres.name,
             rating, screenshots.url, category;
      ${platformId ? `where platforms = (${platformId});` : ''}
      limit 10;
    `;

    try {
      const response = await axios.post(
        `${this.baseUrl}/games`,
        query,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return this.formatSearchResults(response.data);

    } catch (error) {
      console.error('IGDB search error:', error.response?.data || error.message);
      throw new Error(`IGDB API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get detailed game information by IGDB ID
   * @param {number} igdbId - IGDB game ID
   * @returns {Promise<object>} - Game details
   */
  async getGameDetails(igdbId) {
    if (!this.enabled) {
      throw new Error('IGDB API not configured');
    }

    const query = `
      fields name, summary, storyline, cover.url, first_release_date,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, genres.name, rating,
             screenshots.url, websites.url, websites.category,
             game_modes.name, player_perspectives.name,
             aggregated_rating, aggregated_rating_count;
      where id = ${igdbId};
    `;

    try {
      const response = await axios.post(
        `${this.baseUrl}/games`,
        query,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.length === 0) {
        throw new Error('Game not found');
      }

      return this.formatGameDetails(response.data[0]);

    } catch (error) {
      console.error('IGDB details error:', error.response?.data || error.message);
      throw new Error(`IGDB API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Download cover image
   * @param {string} coverUrl - IGDB cover URL
   * @param {number} romId - ROM ID
   * @returns {Promise<string>} - Local file path
   */
  async downloadCoverImage(coverUrl, romId) {
    if (!coverUrl) {
      return null;
    }

    // IGDB URLs are like: //images.igdb.com/igdb/image/upload/t_thumb/co1234.jpg
    // Convert to HTTPS and get larger size
    const fullUrl = coverUrl.startsWith('//') ? `https:${coverUrl}` : coverUrl;
    const largeUrl = fullUrl.replace('t_thumb', 't_cover_big');

    const coverDir = path.join(config.COVERS_PATH);
    ensureDirectoryExists(coverDir);

    const filename = `rom_${romId}_cover.jpg`;
    const filePath = path.join(coverDir, filename);

    try {
      const response = await axios.get(largeUrl, {
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });

    } catch (error) {
      console.error('Cover download error:', error.message);
      return null;
    }
  }

  /**
   * Format search results
   * @param {Array} games - Raw IGDB game data
   * @returns {Array} - Formatted results
   */
  formatSearchResults(games) {
    return games.map(game => ({
      igdb_id: game.id,
      title: game.name,
      summary: game.summary || null,
      cover_url: game.cover?.url || null,
      release_date: game.first_release_date ?
        new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
      genres: game.genres ? game.genres.map(g => g.name).join(', ') : null,
      rating: game.rating ? Math.round(game.rating) : null
    }));
  }

  /**
   * Format detailed game information
   * @param {object} game - Raw IGDB game data
   * @returns {object} - Formatted game details
   */
  formatGameDetails(game) {
    // Extract developer and publisher from involved_companies
    let developer = null;
    let publisher = null;

    if (game.involved_companies) {
      const devCompany = game.involved_companies.find(ic => ic.developer);
      const pubCompany = game.involved_companies.find(ic => ic.publisher);

      developer = devCompany?.company?.name || null;
      publisher = pubCompany?.company?.name || null;
    }

    return {
      igdb_id: game.id,
      title: game.name,
      description: game.summary || game.storyline || null,
      release_date: game.first_release_date ?
        new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null,
      developer,
      publisher,
      genre: game.genres ? game.genres.map(g => g.name).join(', ') : null,
      rating: game.rating ? Math.round(game.rating) / 10 : null,
      cover_url: game.cover?.url || null,
      screenshot_urls: game.screenshots ? game.screenshots.map(s => s.url) : [],
      websites: game.websites || [],
      game_modes: game.game_modes ? game.game_modes.map(m => m.name) : [],
      aggregated_rating: game.aggregated_rating ? Math.round(game.aggregated_rating) / 10 : null
    };
  }

  /**
   * Auto-fetch metadata for ROM
   * @param {string} title - ROM title
   * @param {string} platformShortName - Platform short name
   * @param {number} romId - ROM ID (for cover download)
   * @returns {Promise<object>} - Metadata object
   */
  async autoFetchMetadata(title, platformShortName, romId) {
    if (!this.enabled) {
      console.log('IGDB disabled, skipping metadata fetch');
      return {};
    }

    try {
      console.log(`Fetching metadata for: ${title} (${platformShortName})`);

      // Search for game
      const results = await this.searchGame(title, platformShortName);

      if (results.length === 0) {
        console.log(`No metadata found for: ${title}`);
        return {};
      }

      // Use first result (best match)
      const bestMatch = results[0];

      // Get detailed info
      const details = await this.getGameDetails(bestMatch.igdb_id);

      // Download cover image
      let coverPath = null;
      if (details.cover_url) {
        coverPath = await this.downloadCoverImage(details.cover_url, romId);
      }

      return {
        igdb_id: details.igdb_id,
        description: details.description,
        release_date: details.release_date,
        developer: details.developer,
        publisher: details.publisher,
        genre: details.genre,
        rating: details.rating,
        cover_image_path: coverPath
      };

    } catch (error) {
      console.error('Auto-fetch metadata error:', error.message);
      return {};
    }
  }
}

// Export singleton instance
module.exports = new MetadataService();
