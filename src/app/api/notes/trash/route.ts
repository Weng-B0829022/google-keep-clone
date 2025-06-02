import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/database';

// 獲取垃圾桶中的筆記
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

    console.log(`🗑️ 垃圾桶 API: 正在查詢用戶 ${userId} 的垃圾桶筆記`);

    // 不自動清理！讓用戶能看到垃圾桶中的筆記
    // const cleanedCount = cleanupDeletedNotes();
    // console.log(`🧹 清理了 ${cleanedCount} 個過期筆記`);

    // 先查詢所有已刪除的筆記（不管時間）
    const allDeletedQuery = `
      SELECT id, title, content, user_id, deleted_at,
             datetime('now') as current_time,
             (julianday('now') - julianday(deleted_at)) * 86400 as seconds_since_deleted
      FROM notes 
      WHERE user_id = ? 
      AND deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `;
    
    const allDeletedStmt = db.prepare(allDeletedQuery);
    const allDeletedNotes = allDeletedStmt.all(parseInt(userId)) as any[];
    
    console.log(`📊 所有已刪除筆記: ${allDeletedNotes.length} 個`);
    allDeletedNotes.forEach(note => {
      console.log(`  - ID ${note.id}: 刪除於 ${note.deleted_at}, ${note.seconds_since_deleted.toFixed(1)} 秒前`);
    });

    // 獲取未過期的筆記（30秒內）
    const validNotes = allDeletedNotes.filter(note => note.seconds_since_deleted < 30);
    
    console.log(`✅ 有效垃圾桶筆記: ${validNotes.length} 個`);

    // 解析labels JSON字段並計算剩餘時間
    const notesWithLabelsAndTimeLeft = validNotes.map((note: any) => {
      const timeLeft = Math.max(0, 30 - Math.floor(note.seconds_since_deleted));
      
      console.log(`  - ID ${note.id}: 剩餘 ${timeLeft} 秒`);
      
      return {
        ...note,
        labels: note.labels ? JSON.parse(note.labels) : [],
        timeLeft // 剩餘秒數
      };
    });

    return NextResponse.json({ notes: notesWithLabelsAndTimeLeft });

  } catch (error) {
    console.error('獲取垃圾桶筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 