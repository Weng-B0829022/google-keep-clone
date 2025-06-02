'use client';

import React, { useState, useEffect } from 'react';
import { Note, Label } from '../../../lib/types';

interface NoteEditorProps {
  note?: Note | null;
  labels: Label[];
  onSave: (noteData: any) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, labels, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedLabels(note.labels || []);
      setIsShared(note.is_shared || false);
      
      // 如果筆記已分享且有分享令牌，生成分享URL
      if (note.is_shared && (note as any).share_token) {
        setShareUrl(`${window.location.origin}/shared/${(note as any).share_token}`);
      }
    }
  }, [note]);

  const handleSave = async () => {
    if (!content.trim()) return;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      labels: selectedLabels,
      is_shared: isShared,
    };

    // 調用父組件的保存函數，並處理返回的結果
    try {
      await onSave(noteData);
    } catch (error) {
      console.error('保存失敗:', error);
    }
  };

  const handleLabelToggle = (labelName: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelName)
        ? prev.filter(l => l !== labelName)
        : [...prev, labelName]
    );
  };

  const handleShareToggle = () => {
    setIsShared(!isShared);
    if (!isShared) {
      // 當開啟分享時，清空之前的URL，等保存後會生成新的
      setShareUrl(null);
    } else {
      // 關閉分享時清空URL
      setShareUrl(null);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('複製失敗:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* 標題欄 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {note ? '編輯筆記' : '新增筆記'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 標題輸入 */}
          <input
            type="text"
            placeholder="標題"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 text-lg font-medium border-none outline-none placeholder-gray-400"
          />

          {/* 內容輸入 */}
          <textarea
            placeholder="記下您的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border-none outline-none resize-none placeholder-gray-400 min-h-[200px]"
            autoFocus
          />

          {/* 標籤選擇 */}
          {labels.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">標籤</h3>
              <div className="flex flex-wrap gap-2">
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => handleLabelToggle(label.name)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedLabels.includes(label.name)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 分享設定 */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">分享筆記</span>
              <button
                onClick={handleShareToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isShared ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isShared ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isShared && (
              <div className="mt-3">
                {shareUrl ? (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">分享連結</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          copySuccess 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {copySuccess ? '已複製' : '複製'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      任何擁有此連結的人都可以查看這個筆記
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      儲存筆記後將生成分享連結
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {note ? '儲存' : '新增'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 