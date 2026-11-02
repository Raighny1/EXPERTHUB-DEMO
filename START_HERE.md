# EXPERTHUB Event Demo — Claude 交接包

更新日期：2026-11-02（Asia/Taipei）

將整個資料夾交給 Claude，先請它閱讀 `CLAUDE_PROMPT.md`，再閱讀 `HANDOFF.md`。

## 內容

- `source/dist/`：可直接啟動的完整靜態網站原始碼。
- `source/.openai/hosting.json`：原 Sites 專案設定，僅含專案 ID 與靜態目錄。
- `CLAUDE_PROMPT.md`：給 Claude 的接手指令。
- `HANDOFF.md`：需求、已完成功能、資料結構與限制。
- `VERIFICATION.md`：本次驗證紀錄。

本包不含 `.env.local`、API 金鑰、Git 憑證、報名／問卷資料或上傳圖片。照片與 Banner 存在操作當下的瀏覽器，並不是伺服器上的檔案。

## 本機啟動

不需要安裝 Node 套件或設定任何 API。開啟 PowerShell，切換至本包的 `source/dist` 資料夾，再執行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

- 前台：`http://127.0.0.1:8765/`
- 後台：`http://127.0.0.1:8765/admin/`
- 活動成果 Landing page：`http://127.0.0.1:8765/recap/`

若沒有 Python，可使用任一支援資料夾 `index.html` 的靜態 HTTP server。請透過 HTTP 開啟，以便圖片儲存及跨分頁預覽正常運作。

## 線上 Demo

- 前台：https://experthub-event-demo-r1102.bloomymochi17.chatgpt.site/
- 後台：https://experthub-event-demo-r1102.bloomymochi17.chatgpt.site/admin/
- 成果頁：https://experthub-event-demo-r1102.bloomymochi17.chatgpt.site/recap/

目前 Sites 為私人網站，需使用擁有者的 ChatGPT 帳號登入。Claude 不一定有權存取線上版本，可直接使用本包啟動本機網站。不要為了方便測試而自行改成公開。

資料依瀏覽器的網站來源儲存；線上網址與本機網址、不同連接埠，不會共用資料。
