import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '所有欄位都是必填的' },
        { status: 400 }
      );
    }

    // 檢查用戶是否已存在
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '該電子郵件已被註冊' },
        { status: 409 }
      );
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建新用戶
    const stmt = db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    );
    const result = stmt.run(email, hashedPassword, name);

    // 獲取創建的用戶
    const newUser = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      message: '註冊成功',
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('註冊錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 