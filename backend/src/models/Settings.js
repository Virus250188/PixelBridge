/**
 * Settings Model
 * Handles key-value storage for application settings
 */

const { db } = require('../config/database');

class Settings {
  /**
   * Get a setting value by key
   * @param {string} key - Setting key
   * @param {function} callback - Callback(error, value)
   */
  static get(key, callback) {
    const sql = 'SELECT value FROM settings WHERE key = ?';

    db.get(sql, [key], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row ? row.value : null);
    });
  }

  /**
   * Get all settings
   * @param {function} callback - Callback(error, settings)
   */
  static getAll(callback) {
    const sql = 'SELECT key, value FROM settings';

    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }

      // Convert array to object
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });

      callback(null, settings);
    });
  }

  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {string} value - Setting value
   * @param {function} callback - Callback(error)
   */
  static set(key, value, callback) {
    const sql = `
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `;

    db.run(sql, [key, value], callback);
  }

  /**
   * Set multiple settings at once
   * @param {object} settings - Object with key-value pairs
   * @param {function} callback - Callback(error)
   */
  static setMultiple(settings, callback) {
    const keys = Object.keys(settings);
    let completed = 0;
    let errors = [];

    if (keys.length === 0) {
      return callback(null);
    }

    keys.forEach(key => {
      this.set(key, settings[key], (err) => {
        if (err) {
          errors.push({ key, error: err.message });
        }
        completed++;

        if (completed === keys.length) {
          callback(errors.length > 0 ? errors : null);
        }
      });
    });
  }

  /**
   * Delete a setting
   * @param {string} key - Setting key
   * @param {function} callback - Callback(error)
   */
  static delete(key, callback) {
    const sql = 'DELETE FROM settings WHERE key = ?';
    db.run(sql, [key], callback);
  }
}

module.exports = Settings;
