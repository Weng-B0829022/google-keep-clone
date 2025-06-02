import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/database';

// 獲取用戶的所有標籤
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '需要用戶ID' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('SELECT * FROM labels WHERE user_id = ? ORDER BY name');
    const labels = stmt.all(parseInt(userId));

    return NextResponse.json({ labels });

  } catch (error) {
    console.error('獲取標籤錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 創建新標籤
export async function POST(request: NextRequest) {
  try {
    const { name, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: '標籤名稱和用戶ID為必填項' },
        { status: 400 }
      );
    }

    // 檢查標籤是否已存在
    const existingLabel = db.prepare(
      'SELECT * FROM labels WHERE name = ? AND user_id = ?'
    ).get(name, userId);

    if (existingLabel) {
      return NextResponse.json(
        { error: '標籤已存在' },
        { status: 409 }
      );
    }

    const stmt = db.prepare(
      'INSERT INTO labels (name, user_id) VALUES (?, ?)'
    );
    const result = stmt.run(name, userId);

    const newLabel = db.prepare('SELECT * FROM labels WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      message: '標籤創建成功',
      label: newLabel
    }, { status: 201 });

  } catch (error) {
    console.error('創建標籤錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 