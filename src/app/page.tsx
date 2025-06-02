'use client';

import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import NotesApp from './components/NotesApp';
import { User } from '../../lib/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 檢查本地儲存的用戶信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <NotesApp user={user} onLogout={handleLogout} />
      )}
    </main>
  );
}
