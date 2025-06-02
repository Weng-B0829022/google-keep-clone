const Database = require('better-sqlite3');
const db = new Database('./notes.db');

console.log('=== All tables ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\n=== Notes table structure ===');
const noteTableInfo = db.prepare('PRAGMA table_info(notes)').all();
console.log(noteTableInfo);

console.log('\n=== Users table structure ===');
const userTableInfo = db.prepare('PRAGMA table_info(users)').all();
console.log(userTableInfo);

console.log('\n=== Labels table structure ===');
const labelTableInfo = db.prepare('PRAGMA table_info(labels)').all();
console.log(labelTableInfo);

console.log('\n=== Shared_notes table structure ===');
const sharedTableInfo = db.prepare('PRAGMA table_info(shared_notes)').all();
console.log(sharedTableInfo);

db.close(); 