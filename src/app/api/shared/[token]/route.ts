import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/database';

// 通過分享令牌獲取筆記
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json(
        { error: '缺少分享令牌' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      SELECT n.*, u.name as owner_name 
      FROM notes n 
      JOIN users u ON n.user_id = u.id 
      WHERE n.share_token = ? AND n.is_shared = 1
    `);
    
    const note = stmt.get(token) as any;

    if (!note) {
      return NextResponse.json(
        { error: '筆記不存在或未分享' },
        { status: 404 }
      );
    }

    // 解析labels並隱藏敏感信息
    const sharedNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      labels: note.labels ? JSON.parse(note.labels) : [],
      created_at: note.created_at,
      updated_at: note.updated_at,
      owner_name: note.owner_name
    };

    return NextResponse.json({ note: sharedNote });

  } catch (error) {
    console.error('獲取分享筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 