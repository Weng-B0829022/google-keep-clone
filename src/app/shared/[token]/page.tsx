'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface SharedNote {
  id: number;
  title: string;
  content: string;
  labels: string[];
  created_at: string;
  updated_at: string;
  owner_name: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const token = params.token as string;
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/shared/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setNote(data.note);
        } else {
          setError(data.error || '無法加載筆記');
        }
      } catch (err) {
        setError('網路錯誤');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNote();
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">無法訪問筆記</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">筆記不存在</h1>
            <p className="text-gray-600">此分享連結可能已失效或筆記已被刪除</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-yellow-500">📝</div>
            <h1 className="text-xl font-semibold text-gray-900">Keep</h1>
            <span className="text-sm text-gray-500">- 分享的筆記</span>
          </div>
          <div className="text-sm text-gray-500">
            由 {note.owner_name} 分享
          </div>
        </div>
      </header>

      {/* 筆記內容 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 筆記標題 */}
          {note.title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {note.title}
            </h1>
          )}

          {/* 筆記內容 */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </div>

          {/* 標籤 */}
          {note.labels && note.labels.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">標籤</h3>
              <div className="flex flex-wrap gap-2">
                {note.labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 時間信息 */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>創建時間: {formatDate(note.created_at)}</span>
              <span>更新時間: {formatDate(note.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>這是一個公開分享的筆記，任何擁有此連結的人都可以查看</p>
        </div>
      </main>
    </div>
  );
} 