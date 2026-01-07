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
    this.retroarchIp = process.env.RETROARCH_IP || '192.168.1.100';
    this.retroarchPort = process.env.RETROARCH_PORT || '80';
    this.baseUrl = `http://${this.retroarchIp}:${this.retroarchPort}`;
    // Delay between API calls to prevent overwhelming RetroArch/tvOS
    // Increased from 500ms to 1000ms for more stability
    this.requestDelay = 1000; // 1 second between requests
  }

  /**
   * Helper: Wait for specified milliseconds
   * Prevents overwhelming RetroArch WebUI with too many requests
   */
  async delay(ms = this.requestDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            ip: process.env.RETROARCH_IP || '192.168.1.100',
            port: process.env.RETROARCH_PORT || '80'
          });
        } else {
          resolve({
            ip: settings.retroarch_ip || process.env.RETROARCH_IP || '192.168.1.100',
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

      // Add target path (defaults to 'downloads/' directory - NO leading slash per browser behavior)
      form.append('path', 'downloads/');

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
      // Delay between uploads to prevent overwhelming RetroArch
      await this.delay();
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
   * @param {string} remotePath - Path on Apple TV
   * @param {string} localPath - Local filesystem path to save
   * @returns {Promise<boolean>}
   */
  async downloadFile(remotePath, localPath) {
    try {
      const baseUrl = await this.getBaseUrl();
      // Don't manually encode - axios params handles encoding automatically
      const response = await axios.get(`${baseUrl}/download`, {
        params: { path: remotePath },
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
   * Create directory on RetroArch via POST /create endpoint
   * IMPORTANT: Only creates if directory doesn't exist (RetroArch creates duplicates otherwise!)
   * @param {string} dirPath - Directory path to create (e.g., '/downloads/')
   * @returns {Promise<boolean>}
   */
  async createDirectory(dirPath) {
    try {
      // CRITICAL: First check if directory exists!
      // RetroArch WebUI creates duplicates like "downloads (1)" if we try to create an existing dir
      try {
        await this.listDirectory(dirPath);
        console.log(`📁 Directory already exists: ${dirPath}`);
        return true; // Directory exists, nothing to do
      } catch (listErr) {
        // Directory doesn't exist - proceed to create it
      }

      const baseUrl = await this.getBaseUrl();
      // Use URLSearchParams for proper form-urlencoded encoding
      const params = new URLSearchParams();
      params.append('path', dirPath);

      const response = await axios.post(`${baseUrl}/create`,
        params.toString(),
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      console.log(`✅ Created directory: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to create directory: ${dirPath}`, error.message);
      throw error;
    }
  }

  /**
   * Delete file on RetroArch
   * @param {string} path - File path to delete (WITH leading slash, e.g., '/downloads/file.nes')
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath) {
    // CRITICAL SAFETY CHECK: Never delete critical directories!
    const protectedPaths = ['/downloads/', '/playlists/', '/saves/', '/config/', '/system/'];
    if (protectedPaths.includes(filePath)) {
      console.error(`🚫 BLOCKED: Attempted to delete protected directory: ${filePath}`);
      throw new Error(`Cannot delete protected directory: ${filePath}`);
    }

    try {
      const baseUrl = await this.getBaseUrl();

      // CRITICAL FIX: Use form-urlencoded format (NOT JSON!)
      // Browser sends: Content-Type: application/x-www-form-urlencoded, path=/downloads/file.nes
      const params = new URLSearchParams();
      params.append('path', filePath);

      const response = await axios.post(`${baseUrl}/delete`,
        params.toString(),
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error.message);
      throw error;
    }
  }

  /**
   * Ensure critical directories exist on RetroArch
   * Uses POST /create endpoint to create directories directly
   * @returns {Promise<void>}
   */
  async ensureDirectoriesExist() {
    const criticalDirs = ['/downloads/', '/playlists/', '/saves/', '/states/'];

    for (const dir of criticalDirs) {
      try {
        // First check if directory exists
        await this.listDirectory(dir);
        console.log(`📁 Directory exists: ${dir}`);
      } catch (error) {
        // Directory doesn't exist or can't be listed - create it
        console.log(`⚠️  Directory ${dir} does not exist - creating...`);
        try {
          await this.createDirectory(dir);
        } catch (createError) {
          console.error(`❌ Could not create directory ${dir}:`, createError.message);
        }
      }
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
      form.append('path', 'playlists/');

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
   * Get save games for a specific ROM (from both /saves/ and /states/)
   * @param {string} coreName - Core directory name (e.g., 'Nestopia')
   * @param {string} romName - ROM filename without extension
   * @returns {Promise<Array>}
   */
  async getSaveGames(coreName, romName) {
    const allFiles = [];

    // Check /saves/ directory (in-game saves like battery-backed SRAM)
    try {
      const savesPath = `/saves/${coreName}/`;
      const saveFiles = await this.listDirectory(savesPath);
      const matchingSaves = saveFiles.filter(file =>
        file.name && file.name.startsWith(romName)
      );
      matchingSaves.forEach(f => {
        f.sourceDir = 'saves';
        allFiles.push(f);
      });
    } catch (error) {
      // Directory might not exist, that's OK
      if (!error.message?.includes('404')) {
        console.error(`Failed to get saves for: ${romName}`, error.message);
      }
    }

    // Check /states/ directory (emulator savestates)
    try {
      const statesPath = `/states/${coreName}/`;
      const stateFiles = await this.listDirectory(statesPath);
      const matchingStates = stateFiles.filter(file =>
        file.name && file.name.startsWith(romName)
      );
      matchingStates.forEach(f => {
        f.sourceDir = 'states';
        allFiles.push(f);
      });
    } catch (error) {
      // Directory might not exist, that's OK
      if (!error.message?.includes('404')) {
        console.error(`Failed to get states for: ${romName}`, error.message);
      }
    }

    return allFiles;
  }

  /**
   * Backup save games for a ROM (from both /saves/ and /states/)
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

      // Ensure backup directories exist (separate for saves and states)
      const savesBackupDir = `${localBackupDir}/saves`;
      const statesBackupDir = `${localBackupDir}/states`;

      if (!fs.existsSync(savesBackupDir)) {
        fs.mkdirSync(savesBackupDir, { recursive: true });
      }
      if (!fs.existsSync(statesBackupDir)) {
        fs.mkdirSync(statesBackupDir, { recursive: true });
      }

      for (const saveFile of saveFiles) {
        // Use the sourceDir to determine the correct remote and local paths
        const sourceDir = saveFile.sourceDir || 'saves';
        const remotePath = `/${sourceDir}/${coreName}/${saveFile.name}`;
        const localDir = sourceDir === 'states' ? statesBackupDir : savesBackupDir;
        const localPath = `${localDir}/${saveFile.name}`;

        await this.downloadFile(remotePath, localPath);
        backedUp.push(`${sourceDir}/${saveFile.name}`);
        console.log(`💾 Backed up ${sourceDir}: ${saveFile.name}`);
        // Delay between downloads to prevent overwhelming RetroArch
        await this.delay();
      }

      return backedUp;
    } catch (error) {
      console.error(`Failed to backup saves for: ${romFileName}`, error.message);
      return [];
    }
  }

  /**
   * Restore save games for a ROM (to both /saves/ and /states/)
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
      const restored = [];

      // Restore from /saves subdirectory
      const savesBackupDir = `${localBackupDir}/saves`;
      if (fs.existsSync(savesBackupDir)) {
        const saveFiles = fs.readdirSync(savesBackupDir);
        if (saveFiles.length > 0) {
          // CRITICAL: Ensure the core directory exists before uploading
          console.log(`🔧 Ensuring /saves/${coreName}/ directory exists...`);
          try {
            await this.createDirectory(`/saves/${coreName}/`);
          } catch (dirErr) {
            console.log(`Directory /saves/${coreName}/ may already exist or creation failed:`, dirErr.message);
          }

          for (const saveFile of saveFiles) {
            const localPath = `${savesBackupDir}/${saveFile}`;
            if (!fs.statSync(localPath).isFile()) continue;

            const form = new FormData();
            form.append('files[]', fs.createReadStream(localPath), {
              filename: saveFile,
              contentType: 'application/octet-stream'
            });
            form.append('path', `saves/${coreName}/`);

            await axios.post(`${baseUrl}/upload`, form, {
              headers: { ...form.getHeaders(), 'Accept': 'application/json' },
              timeout: 60000
            });

            restored.push(`saves/${saveFile}`);
            console.log(`💾 Restored save: ${saveFile}`);
            // Delay between uploads to prevent overwhelming RetroArch
            await this.delay();
          }
        }
      }

      // Restore from /states subdirectory
      const statesBackupDir = `${localBackupDir}/states`;
      if (fs.existsSync(statesBackupDir)) {
        const stateFiles = fs.readdirSync(statesBackupDir);
        if (stateFiles.length > 0) {
          // CRITICAL: Ensure the core directory exists before uploading
          console.log(`🔧 Ensuring /states/${coreName}/ directory exists...`);
          try {
            await this.createDirectory(`/states/${coreName}/`);
          } catch (dirErr) {
            console.log(`Directory /states/${coreName}/ may already exist or creation failed:`, dirErr.message);
          }

          for (const stateFile of stateFiles) {
            const localPath = `${statesBackupDir}/${stateFile}`;
            if (!fs.statSync(localPath).isFile()) continue;

            const form = new FormData();
            form.append('files[]', fs.createReadStream(localPath), {
              filename: stateFile,
              contentType: 'application/octet-stream'
            });
            form.append('path', `states/${coreName}/`);

            await axios.post(`${baseUrl}/upload`, form, {
              headers: { ...form.getHeaders(), 'Accept': 'application/json' },
              timeout: 60000
            });

            restored.push(`states/${stateFile}`);
            console.log(`💾 Restored state: ${stateFile}`);
            // Delay between uploads to prevent overwhelming RetroArch
            await this.delay();
          }
        }
      }

      return restored;
    } catch (error) {
      console.error(`Failed to restore saves for core: ${coreName}`, error.message);
      return [];
    }
  }

  /**
   * Upload a .keep file to prevent directory from being deleted
   * RetroArch WebUI deletes empty directories - this prevents that
   * @param {string} directory - Directory path (e.g., '/downloads/')
   * @returns {Promise<boolean>}
   */
  async uploadKeepFile(directory) {
    try {
      const baseUrl = await this.getBaseUrl();
      const form = new FormData();

      // Create a small placeholder file
      const keepContent = Buffer.from('# PixelBridge keep file - do not delete\n');
      form.append('files[]', keepContent, {
        filename: '.keep',
        contentType: 'text/plain'
      });
      // Strip leading slash for upload path (browser behavior)
      const uploadPath = directory.startsWith('/') ? directory.slice(1) : directory;
      form.append('path', uploadPath);

      await axios.post(
        `${baseUrl}/upload`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 10000
        }
      );

      console.log(`✅ Uploaded .keep file to ${directory}`);
      return true;
    } catch (error) {
      console.error(`Failed to upload .keep file to ${directory}:`, error.message);
      return false;
    }
  }

  /**
   * Clear all ROMs from downloads directory
   * @returns {Promise<Object>}
   */
  async clearDownloads() {
    const results = {
      deleted: [],
      failed: [],
      skipped: []
    };

    try {
      // First ensure the directory exists (might have been deleted)
      try {
        await this.listDirectory('/downloads/');
      } catch (listError) {
        console.log('⚠️ Downloads directory does not exist - creating...');
        await this.createDirectory('/downloads/');
        return results; // Nothing to delete
      }

      const files = await this.listDirectory('/downloads/');

      for (const file of files) {
        // Skip special entries
        if (!file.name || file.name === '.' || file.name === '..') {
          continue;
        }

        // Skip hidden files and .keep files
        if (file.name.startsWith('.')) {
          console.log(`Skipping hidden file: ${file.name}`);
          results.skipped.push(file.name);
          continue;
        }

        // CRITICAL: Skip directories!
        const isDirectory = (file.path && file.path.endsWith('/')) ||
                          (file.type && file.type === 'directory') ||
                          (file.isDirectory === true) ||
                          file.name.endsWith('/');

        if (isDirectory) {
          console.log(`Skipping directory: ${file.name}`);
          results.skipped.push(file.name);
          continue;
        }

        // Only delete actual ROM files
        try {
          console.log(`Deleting file: ${file.name}`);
          await this.deleteFile(`/downloads/${file.name}`);
          results.deleted.push(file.name);
          console.log(`✓ Deleted: ${file.name}`);
          // Delay between deletes to prevent overwhelming RetroArch
          await this.delay();
        } catch (error) {
          results.failed.push(file.name);
          console.error(`✗ Failed to delete ${file.name}:`, error.message);
        }
      }

      // CRITICAL: After deleting all files, ensure directory still exists
      // RetroArch WebUI may delete empty directories
      console.log('🔧 Ensuring /downloads/ directory exists after cleanup...');
      await this.createDirectory('/downloads/');

      return results;
    } catch (error) {
      console.error('Failed to clear downloads', error.message);
      // Try to ensure directory exists even on error
      try {
        await this.createDirectory('/downloads/');
      } catch (createErr) {
        console.error('Could not create downloads directory:', createErr.message);
      }
      throw error;
    }
  }

  /**
   * Clear all playlists
   * @returns {Promise<Object>}
   */
  async clearPlaylists() {
    const results = {
      deleted: [],
      failed: [],
      skipped: []
    };

    try {
      // First ensure the directory exists (might have been deleted)
      try {
        await this.listDirectory('/playlists/');
      } catch (listError) {
        console.log('⚠️ Playlists directory does not exist - creating...');
        await this.createDirectory('/playlists/');
        return results; // Nothing to delete
      }

      const playlists = await this.getPlaylists();

      for (const playlist of playlists) {
        // Skip hidden files
        if (playlist.startsWith('.')) {
          console.log(`Skipping hidden file: ${playlist}`);
          results.skipped.push(playlist);
          continue;
        }

        try {
          await this.deleteFile(`/playlists/${playlist}`);
          results.deleted.push(playlist);
          console.log(`Deleted playlist: ${playlist}`);
          // Delay between deletes to prevent overwhelming RetroArch
          await this.delay();
        } catch (error) {
          results.failed.push(playlist);
          console.error(`Failed to delete playlist ${playlist}:`, error.message);
        }
      }

      // CRITICAL: After deleting all files, ensure directory still exists
      console.log('🔧 Ensuring /playlists/ directory exists after cleanup...');
      await this.createDirectory('/playlists/');

      return results;
    } catch (error) {
      console.error('Failed to clear playlists', error.message);
      // Try to ensure directory exists even on error
      try {
        await this.createDirectory('/playlists/');
      } catch (createErr) {
        console.error('Could not create playlists directory:', createErr.message);
      }
      throw error;
    }
  }
}

module.exports = new RetroArchService();
