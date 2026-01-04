/**
 * RetroArch Service
 * Handles communication with RetroArch WebUI on Apple TV
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const config = require('../config/env');
const Settings = require('../models/Settings');

class RetroArchService {
  constructor() {
    this.retroarchIp = process.env.RETROARCH_IP || '192.168.6.125';
    this.retroarchPort = process.env.RETROARCH_PORT || '80';
    this.baseUrl = `http://${this.retroarchIp}:${this.retroarchPort}`;
  }

  /**
   * Get RetroArch connection settings from database
   * Falls back to environment variables if not set
   */
  async getConnectionSettings() {
    return new Promise((resolve) => {
      Settings.getAll((err, settings) => {
        if (err || !settings) {
          // Fallback to environment variables
          resolve({
            ip: process.env.RETROARCH_IP || '192.168.6.125',
            port: process.env.RETROARCH_PORT || '80'
          });
        } else {
          resolve({
            ip: settings.retroarch_ip || process.env.RETROARCH_IP || '192.168.6.125',
            port: settings.retroarch_port || process.env.RETROARCH_PORT || '80'
          });
        }
      });
    });
  }

  /**
   * Get base URL with dynamic settings
   */
  async getBaseUrl() {
    const settings = await this.getConnectionSettings();
    return `http://${settings.ip}:${settings.port}`;
  }

  /**
   * Check if RetroArch is reachable
   */
  async checkConnection() {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.get(baseUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });

      return {
        online: true,
        device: 'Apple TV',
        url: baseUrl
      };
    } catch (error) {
      const baseUrl = await this.getBaseUrl();
      return {
        online: false,
        error: error.message,
        url: baseUrl
      };
    }
  }

  /**
   * Push a single ROM file to RetroArch
   * @param {string} romFilePath - Absolute path to ROM file
   * @param {string} romFileName - Original filename
   * @returns {Promise<Object>}
   */
  async pushRom(romFilePath, romFileName) {
    try {
      const baseUrl = await this.getBaseUrl();
      const form = new FormData();

      // Add file with 'files[]' field name (RetroArch expects array notation)
      form.append('files[]', fs.createReadStream(romFilePath), {
        filename: romFileName,
        contentType: 'application/octet-stream'
      });

      // Add target path (defaults to '/downloads/' directory as shown in browser)
      form.append('path', '/downloads/');

      const response = await axios.post(
        `${baseUrl}/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Accept': 'application/json'
          },
          timeout: 120000, // 2 minutes for large files
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      return {
        success: true,
        fileName: romFileName,
        message: 'ROM successfully pushed to Apple TV'
      };
    } catch (error) {
      console.error(`Failed to push ROM: ${romFileName}`, error.message);

      return {
        success: false,
        fileName: romFileName,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Push multiple ROM files to RetroArch
   * @param {Array<{filePath: string, fileName: string}>} roms
   * @returns {Promise<Object>}
   */
  async pushMultipleRoms(roms) {
    const results = {
      success: [],
      failed: [],
      total: roms.length
    };

    for (const rom of roms) {
      const result = await this.pushRom(rom.filePath, rom.fileName);

      if (result.success) {
        results.success.push(rom.fileName);
      } else {
        results.failed.push({
          fileName: rom.fileName,
          error: result.error
        });
      }
    }

    return results;
  }

  /**
   * List directory contents via RetroArch WebUI
   * @param {string} path - Directory path (e.g., '/downloads/', '/saves/')
   * @returns {Promise<Array>}
   */
  async listDirectory(path) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/list`, {
        params: { path },
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      console.error(`Failed to list directory: ${path}`, error.message);
      throw error;
    }
  }

  /**
   * Download file from RetroArch
   * @param {string} remotePath - Path on Apple TV (URL encoded)
   * @param {string} localPath - Local filesystem path to save
   * @returns {Promise<boolean>}
   */
  async downloadFile(remotePath, localPath) {
    try {
      const baseUrl = await this.getBaseUrl();
      const encodedPath = encodeURIComponent(remotePath);
      const response = await axios.get(`${baseUrl}/download`, {
        params: { path: encodedPath },
        responseType: 'stream',
        timeout: 60000
      });

      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(true));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download file: ${remotePath}`, error.message);
      throw error;
    }
  }

  /**
   * Delete file on RetroArch
   * @param {string} path - File path to delete
   * @returns {Promise<boolean>}
   */
  async deleteFile(path) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.post(`${baseUrl}/delete`,
        { path },
        { timeout: 10000 }
      );

      return true;
    } catch (error) {
      console.error(`Failed to delete file: ${path}`, error.message);
      throw error;
    }
  }

  /**
   * Get all playlist files
   * @returns {Promise<Array<string>>}
   */
  async getPlaylists() {
    try {
      const playlists = await this.listDirectory('/playlists/');
      return playlists
        .filter(item => item.name && item.name.endsWith('.lpl'))
        .map(item => item.name);
    } catch (error) {
      console.error('Failed to get playlists', error.message);
      return [];
    }
  }

  /**
   * Download and parse playlist JSON
   * @param {string} playlistName - Filename (e.g., 'SNES.lpl')
   * @returns {Promise<Object>}
   */
  async downloadPlaylist(playlistName) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/playlists/${playlistName}`, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to download playlist: ${playlistName}`, error.message);
      return null;
    }
  }

  /**
   * Upload playlist file to RetroArch
   * @param {Object} playlistData - Playlist JSON object
   * @param {string} filename - Filename (e.g., 'SNES.lpl')
   * @returns {Promise<boolean>}
   */
  async uploadPlaylist(playlistData, filename) {
    try {
      const baseUrl = await this.getBaseUrl();
      const form = new FormData();

      // Create JSON blob
      const jsonBuffer = Buffer.from(JSON.stringify(playlistData, null, 2));
      form.append('files[]', jsonBuffer, {
        filename: filename,
        contentType: 'application/json'
      });
      form.append('path', '/playlists/');

      const response = await axios.post(
        `${baseUrl}/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to upload playlist: ${filename}`, error.message);
      throw error;
    }
  }

  /**
   * Get save games for a specific ROM
   * @param {string} coreName - Core directory name (e.g., 'snes9x')
   * @param {string} romName - ROM filename without extension
   * @returns {Promise<Array>}
   */
  async getSaveGames(coreName, romName) {
    try {
      const savesPath = `/saves/${coreName}/`;
      const files = await this.listDirectory(savesPath);

      // Filter files that match ROM name
      return files.filter(file =>
        file.name && file.name.startsWith(romName)
      );
    } catch (error) {
      console.error(`Failed to get save games for: ${romName}`, error.message);
      return [];
    }
  }

  /**
   * Backup save games for a ROM
   * @param {string} coreName - Core name
   * @param {string} romFileName - ROM filename
   * @param {string} localBackupDir - Local directory to save backups
   * @returns {Promise<Array<string>>} - List of backed up files
   */
  async backupSaveGames(coreName, romFileName, localBackupDir) {
    try {
      const romNameNoExt = romFileName.replace(/\.[^/.]+$/, '');
      const saveFiles = await this.getSaveGames(coreName, romNameNoExt);
      const backedUp = [];

      // Ensure backup directory exists
      if (!fs.existsSync(localBackupDir)) {
        fs.mkdirSync(localBackupDir, { recursive: true });
      }

      for (const saveFile of saveFiles) {
        const remotePath = `/saves/${coreName}/${saveFile.name}`;
        const localPath = `${localBackupDir}/${saveFile.name}`;

        await this.downloadFile(remotePath, localPath);
        backedUp.push(saveFile.name);
        console.log(`Backed up: ${saveFile.name}`);
      }

      return backedUp;
    } catch (error) {
      console.error(`Failed to backup saves for: ${romFileName}`, error.message);
      return [];
    }
  }

  /**
   * Restore save games for a ROM
   * @param {string} coreName - Core name
   * @param {string} localBackupDir - Local directory with backups
   * @returns {Promise<Array<string>>} - List of restored files
   */
  async restoreSaveGames(coreName, localBackupDir) {
    try {
      if (!fs.existsSync(localBackupDir)) {
        return [];
      }

      const baseUrl = await this.getBaseUrl();
      const saveFiles = fs.readdirSync(localBackupDir);
      const restored = [];

      for (const saveFile of saveFiles) {
        const localPath = `${localBackupDir}/${saveFile}`;
        const form = new FormData();

        form.append('files[]', fs.createReadStream(localPath), {
          filename: saveFile,
          contentType: 'application/octet-stream'
        });
        form.append('path', `/saves/${coreName}/`);

        await axios.post(
          `${baseUrl}/upload`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Accept': 'application/json'
            },
            timeout: 60000
          }
        );

        restored.push(saveFile);
        console.log(`Restored: ${saveFile}`);
      }

      return restored;
    } catch (error) {
      console.error(`Failed to restore saves for core: ${coreName}`, error.message);
      return [];
    }
  }

  /**
   * Clear all ROMs from downloads directory
   * @returns {Promise<Object>}
   */
  async clearDownloads() {
    try {
      const files = await this.listDirectory('/downloads/');
      const results = {
        deleted: [],
        failed: []
      };

      for (const file of files) {
        if (file.name && file.type === 'file') {
          try {
            await this.deleteFile(`/downloads/${file.name}`);
            results.deleted.push(file.name);
            console.log(`Deleted: ${file.name}`);
          } catch (error) {
            results.failed.push(file.name);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to clear downloads', error.message);
      throw error;
    }
  }

  /**
   * Clear all playlists
   * @returns {Promise<Object>}
   */
  async clearPlaylists() {
    try {
      const playlists = await this.getPlaylists();
      const results = {
        deleted: [],
        failed: []
      };

      for (const playlist of playlists) {
        try {
          await this.deleteFile(`/playlists/${playlist}`);
          results.deleted.push(playlist);
          console.log(`Deleted playlist: ${playlist}`);
        } catch (error) {
          results.failed.push(playlist);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to clear playlists', error.message);
      throw error;
    }
  }
}

module.exports = new RetroArchService();
