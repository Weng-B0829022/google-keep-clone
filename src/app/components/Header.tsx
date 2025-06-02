'use client';

import { User } from '../../../lib/types';

interface HeaderProps {
  user: User;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onLogout: () => void;
}

export default function Header({ user, searchTerm, onSearchChange, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-yellow-500">📝</div>
            <h1 className="text-xl font-semibold text-gray-900">Keep</h1>
          </div>
        </div>

        {/* 搜尋欄 (G1功能 - 快速查找相關筆記) */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜尋筆記..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 用戶資訊 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700">{user.name}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded text-sm"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  );
} 