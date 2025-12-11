# Traveler ✈️

一個可愛風格的旅遊行程規劃 App，幫助你輕鬆規劃旅程、管理開銷，並與朋友分享回憶。

**線上預覽 (Demo):** [https://ref45638.github.io/traveler/](https://ref45638.github.io/traveler/)

## ✨ 功能特色 (Features)

- **行程規劃**: 輕鬆建立旅遊行程，設定日期與地點。
- **每日行程 (Itinerary)**: 拖拉式 (Drag & Drop) 介面，自由安排每日活動順序。
- **記帳分帳 (Expenses)**:
  - 記錄每筆消費，支援多種分類 (交通、食物、住宿等)。
  - **分帳功能**: 自動計算誰該付給誰 (Who owes who)，解決多人旅遊的算錢煩惱。
  - 管理付款人 (Payer Management)。
- **可愛介面**: 充滿 Chiikawa 風格的療癒系 UI 設計。
- **多語言支援**: 支援繁體中文與英文切換。
- **雲端同步**: 使用 Supabase 進行資料儲存與使用者認證，換裝置也能看。

## 🛠️ 技術堆疊 (Tech Stack)

- **Frontend**: React, Vite
- **Language**: JavaScript
- **Styling**: CSS Modules, Framer Motion (Animations)
- **Backend / Database**: Supabase (PostgreSQL, Auth)
- **Libraries**:
  - `@dnd-kit`: 拖拉互動
  - `date-fns`: 日期處理
  - `lucide-react`: 圖示庫
  - `react-router-dom`: 路由管理

## 🚀 如何在本地執行 (Local Setup)

如果你想在自己的電腦上執行這個專案：

1.  **Clone 專案**

    ```bash
    git clone https://github.com/ref45638/traveler.git
    cd traveler
    ```

2.  **安裝套件**

    ```bash
    npm install
    ```

3.  **設定環境變數**
    請在根目錄建立 `.env` 檔案，並填入你的 Supabase 設定：

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```

## 📦 部署 (Deployment)

本專案使用 **GitHub Actions** 自動部署至 GitHub Pages。
每次 Push 到 `main` 分支時，會自動觸發部署流程。

---

Made with ❤️ by Traveler Team
