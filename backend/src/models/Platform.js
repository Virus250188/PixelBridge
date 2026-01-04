/**
 * Platform Model
 * Database operations for gaming platforms
 */

const { db } = require('../config/database');

class Platform {
  /**
   * Get all platforms
   */
  static getAll(callback) {
    const sql = `
      SELECT
        id, name, short_name, description, manufacturer,
        retroarch_core, supported_extensions, icon_url, created_at
      FROM platforms
      ORDER BY name ASC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }

      // Parse JSON fields
      const platforms = rows.map(row => ({
        ...row,
        supported_extensions: JSON.parse(row.supported_extensions || '[]')
      }));

      callback(null, platforms);
    });
  }

  /**
   * Get platform by ID
   */
  static getById(id, callback) {
    const sql = `
      SELECT
        id, name, short_name, description, manufacturer,
        retroarch_core, supported_extensions, icon_url, created_at
      FROM platforms
      WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!row) {
        callback(null, null);
        return;
      }

      // Parse JSON field
      const platform = {
        ...row,
        supported_extensions: JSON.parse(row.supported_extensions || '[]')
      };

      callback(null, platform);
    });
  }

  /**
   * Get platform by short name (e.g., 'nes', 'snes')
   */
  static getByShortName(shortName, callback) {
    const sql = `
      SELECT
        id, name, short_name, description, manufacturer,
        retroarch_core, supported_extensions, icon_url, created_at
      FROM platforms
      WHERE short_name = ?
    `;

    db.get(sql, [shortName], (err, row) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!row) {
        callback(null, null);
        return;
      }

      const platform = {
        ...row,
        supported_extensions: JSON.parse(row.supported_extensions || '[]')
      };

      callback(null, platform);
    });
  }

  /**
   * Get ROM count for each platform
   */
  static getPlatformsWithRomCount(callback) {
    const sql = `
      SELECT
        p.id, p.name, p.short_name, p.description, p.manufacturer,
        p.retroarch_core, p.supported_extensions, p.icon_url,
        COUNT(r.id) as rom_count
      FROM platforms p
      LEFT JOIN roms r ON p.id = r.platform_id
      GROUP BY p.id
      ORDER BY p.name ASC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }

      const platforms = rows.map(row => ({
        ...row,
        supported_extensions: JSON.parse(row.supported_extensions || '[]'),
        rom_count: row.rom_count || 0
      }));

      callback(null, platforms);
    });
  }

  /**
   * Search platforms by name
   */
  static search(query, callback) {
    const sql = `
      SELECT
        id, name, short_name, description, manufacturer,
        retroarch_core, supported_extensions, icon_url, created_at
      FROM platforms
      WHERE name LIKE ? OR short_name LIKE ? OR manufacturer LIKE ?
      ORDER BY name ASC
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }

      const platforms = rows.map(row => ({
        ...row,
        supported_extensions: JSON.parse(row.supported_extensions || '[]')
      }));

      callback(null, platforms);
    });
  }
}

module.exports = Platform;
