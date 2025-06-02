import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/database';
import { CreateNoteRequest } from '../../../../lib/types';

// 獲取所有筆記
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const isArchived = searchParams.get('archived');

    if (!userId) {
      return NextResponse.json(
        { error: '需要用戶ID' },
        { status: 400 }
      );
    }

    let query = 'SELECT * FROM notes WHERE user_id = ? AND deleted_at IS NULL';
    const params: any[] = [parseInt(userId)];

    // 處理搜尋
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 處理歸檔篩選
    if (isArchived !== null) {
      query += ' AND is_archived = ?';
      params.push(isArchived === 'true' ? 1 : 0);
    }

    query += ' ORDER BY updated_at DESC';

    const stmt = db.prepare(query);
    const notes = stmt.all(...params) as any[];

    // 解析labels JSON字段
    const notesWithLabels = notes.map((note: any) => ({
      ...note,
      labels: note.labels ? JSON.parse(note.labels) : []
    }));

    return NextResponse.json({ notes: notesWithLabels });

  } catch (error) {
    console.error('獲取筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 創建新筆記
export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteRequest & { userId: number } = await request.json();
    const { title, content, labels = [], userId } = body;

    if (!content || !userId) {
      return NextResponse.json(
        { error: '內容和用戶ID為必填項' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO notes (title, content, user_id, labels)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      title || '',
      content,
      userId,
      JSON.stringify(labels)
    );

    // 獲取創建的筆記
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid) as any;
    
    // 解析labels
    const noteWithLabels = {
      ...newNote,
      labels: newNote.labels ? JSON.parse(newNote.labels) : []
    };

    return NextResponse.json({
      message: '筆記創建成功',
      note: noteWithLabels
    }, { status: 201 });

  } catch (error) {
    console.error('創建筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 