'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '../../../lib/types';

interface TrashNoteCardProps {
  note: Note & { timeLeft: number };
  onRestore: (id: number) => void;
  onExpired: (id: number) => void; // 新增：當筆記過期時調用
}

export default function TrashNoteCard({ note, onRestore, onExpired }: TrashNoteCardProps) {
  const [timeLeft, setTimeLeft] = useState(note.timeLeft);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return '已過期';
    return `${seconds}秒`;
  };

  useEffect(() => {
    setTimeLeft(note.timeLeft);
  }, [note.timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onExpired(note.id); // 通知父組件筆記已過期
        }
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpired, note.id]);

  // 如果時間已過期，不渲染此卡片
  if (timeLeft <= 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
      {/* 剩餘時間指示器 */}
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          timeLeft <= 10 
            ? 'bg-red-100 text-red-600' 
            : timeLeft <= 20 
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {formatTimeLeft(timeLeft)}
        </div>
      </div>

      {/* 筆記內容 */}
      <div className="space-y-2 mb-8 pr-16"> {/* 右邊距為時間標籤留空間 */}
        {note.title && (
          <h3 className="font-medium text-gray-900 text-sm line-clamp-3">
            {note.title}
          </h3>
        )}
        
        <p className="text-gray-700 text-sm line-clamp-6 whitespace-pre-wrap">
          {note.content}
        </p>

        {/* 標籤 */}
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.labels.map((label, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 刪除時間和操作 */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onRestore(note.id)}
            className="px-3 py-1 rounded text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            復原
          </button>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400">
            刪除於: {formatDate(note.deleted_at!)}
          </div>
        </div>
      </div>
    </div>
  );
} 