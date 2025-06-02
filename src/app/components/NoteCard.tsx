'use client';

import React, { useState } from 'react';
import { Note } from '../../../lib/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onArchive: (note: Note) => void;
  onShare?: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onArchive, onShare }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    if (note.is_shared && (note as any).share_token) {
      const shareUrl = `${window.location.origin}/shared/${(note as any).share_token}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('分享連結已複製到剪貼板！');
      }).catch(() => {
        alert('複製失敗，請手動複製連結');
      });
    } else if (onShare) {
      onShare(note);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onEdit(note)}
    >
      {/* 分享狀態指示器 */}
      {note.is_shared ? (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
          已分享
        </div>
      ) : (
        <div>
        </div>
      )}

      {/* 筆記內容 */}
      <div className="space-y-2 mb-8">
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

      {/* 操作按鈕 - 常駐顯示 */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <div className="flex space-x-2">
          {/* 分享/複製連結 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title={note.is_shared ? "複製分享連結" : "分享筆記"}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>

          {/* 歸檔/取消歸檔 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(note);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title={note.is_archived ? "取消封存" : "封存"}
          >
            {note.is_archived ? (
              // 取消歸檔圖示
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            ) : (
              // 歸檔圖示
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            )}
          </button>

          {/* 刪除 (F1功能) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('確定要刪除這個筆記嗎？')) {
                onDelete(note.id);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="刪除筆記"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* 時間戳 */}
        <span className="text-xs text-gray-400">
          {formatDate(note.updated_at)}
        </span>
      </div>
    </div>
  );
} 