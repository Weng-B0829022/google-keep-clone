# Google Keep 筆記系統 - 克隆版

這是一個使用 Next.js、TypeScript、SQLite 構建的 Google Keep 筆記系統克隆版本，實現了需求規格書中的七大核心功能。

## 🚀 核心功能

### A1 - Google 帳號登入支援
- ✅ 用戶註冊與登入系統
- ✅ 密碼加密保護
- ✅ 用戶身份驗證

### B1 - 純文字筆記功能
- ✅ 創建、編輯、刪除筆記
- ✅ 支援標題和內容編輯
- ✅ 自動保存功能

### C1 - 分享筆記內容
- ✅ 筆記公開/私人切換
- ✅ 分享設定管理
- ✅ 用戶權限控制

### E1 - 筆記分類標記
- ✅ 創建和管理標籤
- ✅ 筆記標籤分類
- ✅ 標籤篩選功能

### F1 - 垃圾桶功能
- ✅ 刪除不需要的筆記
- ✅ 確認刪除機制
- ✅ 永久刪除處理

### G1 - 搜尋歷史筆記
- ✅ 標題和內容搜尋
- ✅ 即時搜尋結果
- ✅ 快速查找相關筆記

## 🛠 技術棧

- **框架**: Next.js 15 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **數據庫**: SQLite (better-sqlite3)
- **認證**: 自建認證系統 (bcryptjs)
- **API**: Next.js API Routes

## 📦 安裝與運行

### 1. 克隆項目
```bash
git clone <repository-url>
cd google-keep-clone
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 運行開發服務器
```bash
npm run dev
```

### 4. 開啟瀏覽器
訪問 [http://localhost:3000](http://localhost:3000)

## 📁 項目結構

```
google-keep-clone/
├── src/
│   └── app/
│       ├── api/                 # API 路由
│       │   ├── auth/           # 認證相關 API
│       │   ├── notes/          # 筆記相關 API
│       │   └── labels/         # 標籤相關 API
│       ├── components/         # React 組件
│       │   ├── LoginForm.tsx   # 登入表單
│       │   ├── NotesApp.tsx    # 主應用
│       │   ├── Header.tsx      # 頂部導航
│       │   ├── Sidebar.tsx     # 側邊欄
│       │   ├── NoteCard.tsx    # 筆記卡片
│       │   └── NoteEditor.tsx  # 筆記編輯器
│       ├── page.tsx            # 主頁面
│       └── layout.tsx          # 佈局
├── lib/
│   ├── database.ts             # 數據庫連接和設置
│   └── types.ts                # TypeScript 類型定義
└── notes.db                    # SQLite 數據庫文件
```

## 🎨 功能特色

### 🎯 用戶體驗
- 直觀的用戶界面設計
- 響應式佈局，支援各種螢幕尺寸
- 流暢的動畫和過渡效果
- 類似原版 Google Keep 的操作體驗

### 🔧 技術特色
- 使用 TypeScript 提供類型安全
- SQLite 本地數據庫，無需額外設置
- RESTful API 設計
- 現代化的 React Hooks 和函數組件

### 📱 界面功能
- 網格佈局的筆記顯示
- 顏色主題選擇
- 即時搜尋過濾
- 拖拽式操作體驗

## 🔒 安全性

- 密碼 bcrypt 加密
- SQL 注入防護
- 用戶身份驗證
- 數據輸入驗證

## 📋 待開發功能

- [ ] 筆記匯出功能
- [ ] 圖片附件支援
- [ ] 提醒和通知
- [ ] 協作編輯
- [ ] 暗色主題

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個項目！

## 📄 授權

MIT License

---

這個項目是根據 Google Keep 筆記系統設計規格書實現的教育性克隆版本。
#   g o o g l e - k e e p - c l o n e  
 