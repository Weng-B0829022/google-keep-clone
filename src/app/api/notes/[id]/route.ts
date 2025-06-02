import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/database';
import { UpdateNoteRequest } from '../../../../../lib/types';
import { randomBytes } from 'crypto';

// 生成分享令牌
function generateShareToken(): string {
  return randomBytes(16).toString('hex');
}

// 獲取單個筆記
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL');
    const note = stmt.get(parseInt(id)) as any;

    if (!note) {
      return NextResponse.json(
        { error: '筆記不存在' },
        { status: 404 }
      );
    }

    // 解析labels
    const noteWithLabels = {
      ...note,
      labels: note.labels ? JSON.parse(note.labels) : []
    };

    return NextResponse.json({ note: noteWithLabels });

  } catch (error) {
    console.error('獲取筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 更新筆記
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: UpdateNoteRequest = await request.json();

    // 構建動態更新查詢
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.content !== undefined) {
      updateFields.push('content = ?');
      values.push(updates.content);
    }
    
    if (updates.is_archived !== undefined) {
      updateFields.push('is_archived = ?');
      values.push(updates.is_archived ? 1 : 0); // 轉換 boolean 為 integer
    }
    
    if (updates.is_shared !== undefined) {
      updateFields.push('is_shared = ?');
      values.push(updates.is_shared ? 1 : 0); // 轉換 boolean 為 integer
      
      // 如果設為分享，生成分享令牌；如果取消分享，清除令牌
      if (updates.is_shared) {
        updateFields.push('share_token = ?');
        values.push(generateShareToken());
      } else {
        updateFields.push('share_token = ?');
        values.push(null);
      }
    }
    
    if (updates.labels !== undefined) {
      updateFields.push('labels = ?');
      values.push(JSON.stringify(updates.labels));
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    values.push(parseInt(id));
    
    const stmt = db.prepare(query);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '筆記不存在或無變更' },
        { status: 404 }
      );
    }

    // 獲取更新後的筆記
    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL').get(parseInt(id)) as any;
    const noteWithLabels = {
      ...updatedNote,
      labels: updatedNote.labels ? JSON.parse(updatedNote.labels) : [],
      share_url: updatedNote.is_shared && updatedNote.share_token 
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shared/${updatedNote.share_token}`
        : null
    };

    return NextResponse.json({
      message: '筆記更新成功',
      note: noteWithLabels
    });

  } catch (error) {
    console.error('更新筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 復原筆記
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'restore') {
      // 復原筆記（清除 deleted_at）
      const stmt = db.prepare('UPDATE notes SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NOT NULL');
      const result = stmt.run(parseInt(id));

      if (result.changes === 0) {
        return NextResponse.json(
          { error: '筆記不存在或未被刪除' },
          { status: 404 }
        );
      }

      // 獲取復原後的筆記
      const restoredNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(parseInt(id)) as any;
      const noteWithLabels = {
        ...restoredNote,
        labels: restoredNote.labels ? JSON.parse(restoredNote.labels) : []
      };

      return NextResponse.json({
        message: '筆記已復原',
        note: noteWithLabels
      });
    }

    return NextResponse.json(
      { error: '無效的操作' },
      { status: 400 }
    );

  } catch (error) {
    console.error('復原筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

// 軟刪除筆記 (移動至垃圾桶)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 軟刪除：設置 deleted_at 時間戳
    const stmt = db.prepare('UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL');
    const result = stmt.run(parseInt(id));

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '筆記不存在或已被刪除' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '筆記已移動至垃圾桶'
    });

  } catch (error) {
    console.error('刪除筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 