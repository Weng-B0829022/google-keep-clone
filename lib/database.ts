import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'notes.db');
const db = new Database(dbPath);

// 初始化數據庫表
export function initDatabase() {
  // 用戶表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 筆記表
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      is_archived BOOLEAN DEFAULT FALSE,
      is_shared BOOLEAN DEFAULT FALSE,
      share_token TEXT UNIQUE, -- 分享令牌，用於生成分享URL
      labels TEXT, -- JSON字符串存儲標籤
      deleted_at DATETIME, -- 軟刪除時間戳，NULL表示未刪除
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // 標籤表
  db.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // 分享表 (保留用於記錄分享歷史，但主要使用 share_token)
  db.exec(`
    CREATE TABLE IF NOT EXISTS shared_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      shared_with_email TEXT NOT NULL,
      permission TEXT DEFAULT 'view', -- 'view' or 'edit'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes (id)
    )
  `);
}

// 檢查並添加新欄位 (用於現有資料庫升級)
export function upgradeDatabase() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(notes)").all() as { name: string }[];
    
    const hasShareToken = tableInfo.some(column => column.name === 'share_token');
    if (!hasShareToken) {
      db.exec('ALTER TABLE notes ADD COLUMN share_token TEXT UNIQUE');
      console.log('✅ 已添加 share_token 欄位');
    }

    const hasDeletedAt = tableInfo.some(column => column.name === 'deleted_at');
    if (!hasDeletedAt) {
      db.exec('ALTER TABLE notes ADD COLUMN deleted_at DATETIME');
      console.log('✅ 已添加 deleted_at 欄位');
    }
  } catch (error) {
    console.log('資料庫升級完成或已是最新版本');
  }
}

// 手動清理已刪除超過30秒的筆記 (不自動執行)
export function cleanupDeletedNotes() {
  try {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const result = db.prepare('DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < ?').run(thirtySecondsAgo);
    
    if (result.changes > 0) {
      console.log(`🗑️ 清理了 ${result.changes} 個已刪除的筆記`);
    }
    
    return result.changes;
  } catch (error) {
    console.error('清理已刪除筆記時發生錯誤:', error);
    return 0;
  }
}

// 初始化數據庫
initDatabase();
upgradeDatabase();

// 不在啟動時自動清理，讓垃圾桶功能正常工作
// cleanupDeletedNotes();

export default db; 