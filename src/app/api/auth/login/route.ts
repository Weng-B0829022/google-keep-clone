import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '電子郵件和密碼為必填項' },
        { status: 400 }
      );
    }

    // 查找用戶
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 401 }
      );
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密碼錯誤' },
        { status: 401 }
      );
    }

    // 移除密碼字段
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '登入成功',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 