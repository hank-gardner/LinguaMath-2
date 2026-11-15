# LinguaMath - 多語種與數學單詞卡學習系統

本專案是一個基於 React、TypeScript 與 Tailwind CSS 構建的現代化多語種（中文、英文）與數學單詞卡學習系統，支援間歇性重複複習（Spaced Repetition）、語音合成與 AI 自動分析。

---

## 🚀 GitHub Pages 部署與上傳指南

為了讓本專案順利部署至 GitHub Pages 並解決白屏問題，請遵循以下步驟：

### 1. 必須上傳至 GitHub 的檔案
請將專案根目錄下的所有檔案與資料夾推送至您的 GitHub 儲存庫（Repository），包含：
- `.github/workflows/deploy.yml`（自動化 GitHub Actions 部署腳本）
- `src/`（源代碼目錄）
- `public/`（包含 `.nojekyll` 等靜態資源）
- `vite.config.ts`、`package.json`、`package-lock.json`、`tsconfig.json`、`index.html`

### 2. 切勿上傳的檔案
請確保以下檔案與資料夾不會被上傳至 GitHub（預設已包含在 `.gitignore` 中）：
- `node_modules/`（依賴套件資料夾）
- `dist/`（編譯產物資料夾）
- `.env`、`.env.local` 等機密環境變數檔案

---

## ⚙️ GitHub 儲存庫設定步驟

1. **設定 Pages 來源：**
   - 進入您的 GitHub 儲存庫頁面，點擊 **Settings**（設定） > **Pages**。
   - 在 **Build and deployment** > **Source** 下拉選單中，將來源由 *Deploy from a branch* 改為 **GitHub Actions**。

2. **觸發自動部署：**
   - 將代碼推送到 `main` 或 `master` 分支，GitHub Actions 將會自動執行建置與部署。
   - 您也可以隨時前往 **Actions** 分支手動點擊 **Run workflow** 進行部署。

---

## 🔍 如何檢視 Actions 錯誤日誌

1. 點擊 GitHub 儲存庫頂部的 **Actions** 標籤頁。
2. 點擊最近一次執行的工作流程（Workflow run，例如 *Deploy to GitHub Pages*）。
3. 點擊左側的 **build-and-deploy** 作業，即可展開詳細步驟（如 *Set up Node.js*、*Install dependencies*、*Build with Vite*）。
4. 若建置失敗，可在對應步驟中檢視紅色的錯誤訊息與堆疊追蹤。

---

## ⚠️ GitHub Pages 後端功能限制說明

- **靜態主機限制：** GitHub Pages 是完全靜態的網頁主機，不支援運行 Node.js 伺服器（如 `server.ts` 中的後端 Express 路由與 `/api/llm/chat` 代理端點）。
- **客戶端 API 運作方式：** 本系統採用「零伺服器中繼（Zero Server Relay）」架構，使用者的 Groq / OpenRouter API Key 會安全地儲存在本地瀏覽器的 `localStorage` 中，並直接由瀏覽器發送請求至 AI 供應商 API。
- **資料持久化：** 所有學習進度、單詞卡片與複習記錄皆透過瀏覽器的 `localStorage` 進行本地持久化，無需任何後端資料庫。
