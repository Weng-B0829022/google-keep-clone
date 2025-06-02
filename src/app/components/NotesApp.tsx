'use client';

import { useState, useEffect } from 'react';
import { User, Note, Label } from '../../../lib/types';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import Sidebar from './Sidebar';
import Header from './Header';
import TrashNoteCard from './TrashNoteCard';

interface NotesAppProps {
  user: User;
  onLogout: () => void;
}

export default function NotesApp({ user, onLogout }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashNotes, setTrashNotes] = useState<(Note & { timeLeft: number })[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'notes' | 'archived' | 'trash'>('notes');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加載筆記
  const loadNotes = async () => {
    try {
      const isArchived = currentView === 'archived';
      const response = await fetch(
        `/api/notes?userId=${user.id}&search=${searchTerm}&archived=${isArchived}`
      );
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('加載筆記失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加載垃圾桶筆記
  const loadTrashNotes = async () => {
    try {
      console.log('🗑️ 正在加載垃圾桶筆記...', `userId: ${user.id}`);
      const response = await fetch(`/api/notes/trash?userId=${user.id}`);
      const data = await response.json();
      
      console.log('垃圾桶 API 響應:', { status: response.status, ok: response.ok, data });
      
      if (response.ok) {
        setTrashNotes(data.notes);
        console.log(`✅ 已加載 ${data.notes.length} 個垃圾桶筆記`);
      } else {
        console.error('垃圾桶 API 錯誤:', data.error);
        setTrashNotes([]); // 確保清空列表
      }
    } catch (error) {
      console.error('加載垃圾桶筆記失敗:', error);
      setTrashNotes([]); // 確保清空列表
    }
  };

  // 加載標籤
  const loadLabels = async () => {
    try {
      const response = await fetch(`/api/labels?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('加載標籤失敗:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'trash') {
      loadTrashNotes();
    } else {
      loadNotes();
    }
    loadLabels();
  }, [user.id, searchTerm, currentView]);

  // 處理筆記過期
  const handleNoteExpired = async (noteId: number) => {
    // 從當前列表中移除過期的筆記
    setTrashNotes(prev => prev.filter(note => note.id !== noteId));
    
    // 觸發清理過期筆記
    try {
      const response = await fetch('/api/notes/cleanup', { method: 'POST' });
      if (response.ok) {
        console.log('過期筆記已清理');
      }
    } catch (error) {
      console.error('清理過期筆記失敗:', error);
    }
  };

  // 定期更新垃圾桶筆記（每5秒）
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentView === 'trash') {
      interval = setInterval(loadTrashNotes, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentView]);

  // 創建或更新筆記
  const handleSaveNote = async (noteData: any) => {
    try {
      const isUpdate = selectedNote?.id;
      const url = isUpdate ? `/api/notes/${selectedNote.id}` : '/api/notes';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const payload = isUpdate ? noteData : { ...noteData, userId: user.id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 如果返回了分享URL，可以在這裡處理
        if (data.note && data.note.share_url) {
          console.log('分享URL生成:', data.note.share_url);
          
          // 更新選中的筆記以包含分享信息
          if (isUpdate) {
            setSelectedNote(prev => prev ? {
              ...prev,
              is_shared: data.note.is_shared,
              share_token: data.note.share_token
            } : null);
          }
        }
        
        await loadNotes();
        setIsEditorOpen(false);
        setSelectedNote(null);
      } else {
        const errorData = await response.json();
        console.error('保存失敗:', errorData.error);
      }
    } catch (error) {
      console.error('保存筆記失敗:', error);
    }
  };

  // 軟刪除筆記 (直接移動至垃圾桶)
  const handleDeleteNote = async (noteId: number) => {
    try {
      console.log(`🗑️ 正在刪除筆記 ID: ${noteId}`);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      console.log('刪除 API 響應:', { status: response.status, ok: response.ok, data: responseData });

      if (response.ok) {
        console.log('✅ 筆記已成功移動到垃圾桶');
        
        // 重新加載筆記列表
        await loadNotes();
        
        // 如果當前在垃圾桶視圖，也重新加載垃圾桶
        if (currentView === 'trash') {
          console.log('當前在垃圾桶視圖，重新加載垃圾桶...');
          await loadTrashNotes();
        }
        
        // 提供用戶反饋
        console.log('筆記已移動到垃圾桶，將在30秒後永久刪除');
      } else {
        console.error('刪除失敗:', responseData.error);
        alert('刪除筆記失敗，請重試');
      }
    } catch (error) {
      console.error('刪除筆記失敗:', error);
      alert('刪除筆記失敗，請重試');
    }
  };

  // 復原筆記
  const handleRestoreNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (response.ok) {
        // 重新加載相應的列表
        if (currentView === 'trash') {
          await loadTrashNotes();
        } else {
          await loadNotes();
        }
      }
    } catch (error) {
      console.error('復原筆記失敗:', error);
    }
  };

  // 歸檔筆記
  const handleArchiveNote = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_archived: !note.is_archived }),
      });

      if (response.ok) {
        await loadNotes();
      }
    } catch (error) {
      console.error('歸檔筆記失敗:', error);
    }
  };

  // 打開筆記編輯器
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  // 創建新筆記
  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  // 分享筆記
  const handleShareNote = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_shared: !note.is_shared }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 如果開啟分享並生成了URL，複製到剪貼板
        if (data.note.is_shared && data.note.share_url) {
          try {
            await navigator.clipboard.writeText(data.note.share_url);
            alert('分享已開啟，連結已複製到剪貼板！');
          } catch (err) {
            alert(`分享已開啟！連結：${data.note.share_url}`);
          }
        } else {
          alert('分享已關閉');
        }
        
        await loadNotes();
      }
    } catch (error) {
      console.error('分享筆記失敗:', error);
    }
  };

  // 篩選筆記
  const filteredNotes = notes.filter(note => {
    if (currentView === 'archived') {
      return note.is_archived;
    }
    return !note.is_archived;
  });

  // 獲取當前視圖的標題和描述
  const getViewInfo = () => {
    switch (currentView) {
      case 'notes':
        return { title: '筆記', description: null };
      case 'archived':
        return { title: '封存的筆記', description: null };
      case 'trash':
        return { 
          title: '垃圾桶', 
          description: '筆記將在30秒後永久刪除' 
        };
      default:
        return { title: '筆記', description: null };
    }
  };

  const viewInfo = getViewInfo();

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={user}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLogout={onLogout}
      />
      
      <div className="flex">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          labels={labels}
          onRefreshLabels={loadLabels}
          userId={user.id}
        />
        
        <main className="flex-1 p-6">
          {/* 視圖標題和提示 */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{viewInfo.title}</h1>
            {viewInfo.description && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-yellow-800 text-sm font-medium">{viewInfo.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* 新增筆記按鈕 (僅在主筆記視圖顯示) */}
          {currentView === 'notes' && (
            <div className="mb-6">
              <button
                onClick={handleNewNote}
                className="bg-white border border-gray-300 rounded-lg p-4 w-full max-w-md text-left text-gray-500 hover:shadow-md transition-shadow"
              >
                記下您的想法...
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentView === 'trash' ? (
                // 垃圾桶視圖
                trashNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trashNotes.map(note => (
                      <TrashNoteCard
                        key={note.id}
                        note={note}
                        onRestore={handleRestoreNote}
                        onExpired={handleNoteExpired}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">垃圾桶是空的</div>
                  </div>
                )
              ) : (
                // 一般筆記視圖
                filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onArchive={handleArchiveNote}
                        onShare={handleShareNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">
                      {currentView === 'archived' ? '沒有已封存的筆記' : '還沒有筆記'}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>

      {/* 筆記編輯器 */}
      {isEditorOpen && (
        <NoteEditor
          note={selectedNote}
          labels={labels}
          onSave={handleSaveNote}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedNote(null);
          }}
        />
      )}
    </div>
  );
} 