/**
 * ROM Model
 * Database operations for ROM files
 */

const { db } = require('../config/database');

class Rom {
  /**
   * Get all ROMs with optional filters
   */
  static getAll(filters = {}, callback) {
    let sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by platform
    if (filters.platform_id) {
      sql += ' AND r.platform_id = ?';
      params.push(filters.platform_id);
    }

    // Search by title
    if (filters.search) {
      sql += ' AND r.title LIKE ?';
      params.push(`%${filters.search}%`);
    }

    // Filter favorites
    if (filters.favorite) {
      sql += ' AND r.favorite = 1';
    }

    // Sorting
    const sortBy = filters.sort_by || 'title';
    const sortOrder = filters.sort_order || 'ASC';
    sql += ` ORDER BY r.${sortBy} ${sortOrder}`;

    // Pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    db.all(sql, params, callback);
  }

  /**
   * Get ROM by ID
   */
  static getById(id, callback) {
    const sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name,
        p.retroarch_core
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      WHERE r.id = ?
    `;

    db.get(sql, [id], callback);
  }

  /**
   * Get ROMs by platform ID
   */
  static getByPlatformId(platformId, callback) {
    const sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      WHERE r.platform_id = ?
      ORDER BY r.title ASC
    `;

    db.all(sql, [platformId], callback);
  }

  /**
   * Check if ROM exists by file hash
   */
  static existsByHash(fileHash, callback) {
    const sql = 'SELECT id, title, file_name FROM roms WHERE file_hash = ?';
    db.get(sql, [fileHash], callback);
  }

  /**
   * Create new ROM
   */
  static create(romData, callback) {
    const sql = `
      INSERT INTO roms (
        title, platform_id, file_name, file_path, file_size, file_hash,
        description, release_date, publisher, developer, genre, rating, players,
        cover_image_path, screenshot_path, igdb_id, screenscraper_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      romData.title,
      romData.platform_id,
      romData.file_name,
      romData.file_path,
      romData.file_size || null,
      romData.file_hash || null,
      romData.description || null,
      romData.release_date || null,
      romData.publisher || null,
      romData.developer || null,
      romData.genre || null,
      romData.rating || null,
      romData.players || null,
      romData.cover_image_path || null,
      romData.screenshot_path || null,
      romData.igdb_id || null,
      romData.screenscraper_id || null
    ];

    db.run(sql, params, function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, { id: this.lastID, ...romData });
    });
  }

  /**
   * Update ROM
   */
  static update(id, romData, callback) {
    const sql = `
      UPDATE roms SET
        title = ?,
        description = ?,
        release_date = ?,
        publisher = ?,
        developer = ?,
        genre = ?,
        rating = ?,
        players = ?,
        cover_image_path = ?,
        screenshot_path = ?,
        igdb_id = ?,
        screenscraper_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      romData.title,
      romData.description,
      romData.release_date,
      romData.publisher,
      romData.developer,
      romData.genre,
      romData.rating,
      romData.players,
      romData.cover_image_path,
      romData.screenshot_path,
      romData.igdb_id,
      romData.screenscraper_id,
      id
    ];

    db.run(sql, params, function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, { changes: this.changes });
    });
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(id, callback) {
    const sql = `
      UPDATE roms
      SET favorite = NOT favorite,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [id], function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, { changes: this.changes });
    });
  }

  /**
   * Increment play count
   */
  static incrementPlayCount(id, callback) {
    const sql = `
      UPDATE roms
      SET play_count = play_count + 1,
          last_played = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [id], function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, { changes: this.changes });
    });
  }

  /**
   * Delete ROM
   */
  static delete(id, callback) {
    const sql = 'DELETE FROM roms WHERE id = ?';

    db.run(sql, [id], function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, { changes: this.changes });
    });
  }

  /**
   * Get total ROM count
   */
  static getCount(filters = {}, callback) {
    let sql = 'SELECT COUNT(*) as count FROM roms WHERE 1=1';
    const params = [];

    if (filters.platform_id) {
      sql += ' AND platform_id = ?';
      params.push(filters.platform_id);
    }

    if (filters.search) {
      sql += ' AND title LIKE ?';
      params.push(`%${filters.search}%`);
    }

    if (filters.favorite) {
      sql += ' AND favorite = 1';
    }

    db.get(sql, params, callback);
  }

  /**
   * Get recently added ROMs
   */
  static getRecentlyAdded(limit = 10, callback) {
    const sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `;

    db.all(sql, [limit], callback);
  }

  /**
   * Get recently played ROMs
   */
  static getRecentlyPlayed(limit = 10, callback) {
    const sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      WHERE r.last_played IS NOT NULL
      ORDER BY r.last_played DESC
      LIMIT ?
    `;

    db.all(sql, [limit], callback);
  }

  /**
   * Get favorite ROMs
   */
  static getFavorites(callback) {
    const sql = `
      SELECT
        r.*,
        p.name as platform_name,
        p.short_name as platform_short_name
      FROM roms r
      LEFT JOIN platforms p ON r.platform_id = p.id
      WHERE r.favorite = 1
      ORDER BY r.title ASC
    `;

    db.all(sql, [], callback);
  }
}

module.exports = Rom;
