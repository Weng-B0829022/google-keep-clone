'use client';

import { useState } from 'react';
import { Label } from '../../../lib/types';

interface SidebarProps {
  currentView: 'notes' | 'archived' | 'trash';
  onViewChange: (view: 'notes' | 'archived' | 'trash') => void;
  labels: Label[];
  onRefreshLabels: () => void;
  userId: number;
}

export default function Sidebar({ currentView, onViewChange, labels, onRefreshLabels, userId }: SidebarProps) {
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLabelName.trim(),
          userId
        }),
      });

      if (response.ok) {
        setNewLabelName('');
        setIsAddingLabel(false);
        onRefreshLabels();
      }
    } catch (error) {
      console.error('創建標籤失敗:', error);
    }
  };

  const menuItems = [
    {
      id: 'notes',
      label: '筆記',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      view: 'notes' as const
    },
    {
      id: 'archived',
      label: '封存',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      view: 'archived' as const
    },
    {
      id: 'trash',
      label: '垃圾桶',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      view: 'trash' as const
    }
  ];

  return (
    <aside className="w-64 bg-gray-50 min-h-screen border-r border-gray-200">
      <div className="p-4">
        {/* 主選單 */}
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === item.view
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 標籤區塊 (E1功能 - 支援筆記分類標記) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">標籤</h3>
            <button
              onClick={() => setIsAddingLabel(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* 新增標籤表單 */}
          {isAddingLabel && (
            <div className="mb-3">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="標籤名稱"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLabel();
                  } else if (e.key === 'Escape') {
                    setIsAddingLabel(false);
                    setNewLabelName('');
                  }
                }}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleAddLabel}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  新增
                </button>
                <button
                  onClick={() => {
                    setIsAddingLabel(false);
                    setNewLabelName('');
                  }}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 標籤列表 */}
          <div className="space-y-1">
            {labels.map(label => (
              <div
                key={label.id}
                className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{label.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
} 