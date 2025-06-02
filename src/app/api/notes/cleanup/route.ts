import { NextRequest, NextResponse } from 'next/server';
import { cleanupDeletedNotes } from '../../../../../lib/database';

// 清理過期的已刪除筆記
export async function POST(request: NextRequest) {
  try {
    const cleanedCount = cleanupDeletedNotes();
    
    return NextResponse.json({
      message: `清理了 ${cleanedCount} 個過期筆記`,
      cleanedCount
    });

  } catch (error) {
    console.error('清理筆記錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 