# 功能與技術交接

## 目前定位

EXPERTHUB 的活動管理互動 Demo，前後台獨立入口。沿用深綠、淺綠與米白視覺，介面主要為繁體中文。

### 前台 `/`

- 活動介紹、議程與報名資訊由後台設定帶入。
- Banner 提供預設圖形搭配文字，或上傳圖片。
- 純圖片模式保留原圖比例；疊字模式以封面方式裁切，顯示活動名稱、標語與日期。
- 報名表讀取欄位顯示與必填設定，檢查名額、截止時間與重複 Email。
- 現場問卷依後台題目動態呈現，支援評分、單選、複選與文字題。
- 活動成果分頁只提供已發布版本入口，不顯示未審核草稿。

### 後台 `/admin/`

1. **活動與報名設定**：活動名稱、標語、介紹、日期、時間、地點、形式、參與對象、議程、名額、截止時間與報名開關。
2. **Banner 設定**：Default／Upload 模式、上傳、預覽、替代文字、疊字選項及移除。支援 JPG／PNG／WebP／GIF，上限 10 MB。
3. **報名表欄位**：報名姓名、公司名稱、Email、聯絡電話、產業類別、職稱、部門。姓名與 Email 固定必填，其餘可調整顯示／必填。產業類別為可編輯選項的下拉選單。
4. **報名名單**：顯示完整欄位並匯出 CSV。
5. **問卷設計與回覆**：從題庫加題、自訂題目、修改題型／選項／必填、排序／移除、預覽、開關填答與回覆匯出。每筆回覆保留當時的題目文字與問卷版本。
6. **成果 Landing page**：照片、影片與簡報素材上傳；選封面、照片說明、調整順序，提供 Editorial／Gallery 兩種版型。
7. **MKT Review**：預覽完整成果頁、退回修改、核准後發布。
8. **AI 大腦同步**：僅保留既有知識庫整合的流程示範。

### 成果頁 `/recap/`

- 獨立 Landing page，大圖封面、活動摘要、相片牆、影片與簡報下載區塊。
- 至少一張可讀取的照片才能產生預覽或送審。
- 素材上限每檔 80 MB，影像會先驗證能否解碼。
- 未發布時顯示待發布提示。
- 已發布後再編輯，前台持續顯示舊版，直到新版通過 Review 並發布。

## 檔案對照

| 檔案 | 用途 |
|---|---|
| `source/dist/index.html` | 前台殼層與報名彈窗 |
| `source/dist/visitor.js` | 前台動態內容、報名與問卷提交 |
| `source/dist/admin/index.html` | 後台殼層與側邊選單 |
| `source/dist/admin.js` | 活動設定、名單、問卷、成果編輯與審核流程 |
| `source/dist/event-customization.js` | Banner 設定／預覽／上傳、報名欄位設定與表單預覽 |
| `source/dist/shared.js` | 預設資料、共用表單、Banner／Landing page 排版、儲存與 CSV 工具 |
| `source/dist/recap/index.html` | 已發布成果 Landing page 入口 |
| `source/dist/styles.css` | 共用樣式與響應式排版 |
| `source/.openai/hosting.json` | 現有私人 Sites 專案識別與靜態部署目錄 |

## 資料與持久化

- `localStorage` key：`experthub-event-demo-v1`。
- 主要資料：`state.event`、`registrations`、`questions`、`responses`、`assets`。
- `state.event.registrationFields` 存每個欄位的 `enabled`／`required`；`industryOptions` 存產業選項。
- `state.event.bannerMode`／`bannerId`／`bannerName`／`bannerShowText`／`bannerAlt` 存 Banner 設定。
- IndexedDB：`experthub-event-media`，object store：`files`，以素材 ID 存原始 Blob／File。
- `uploads` 為各分頁中的記憶體清單，持有檔案與 Object URL；載入時會從 IndexedDB 還原。
- `storage` event 更新同來源的其他分頁。
- `reviewRecap` 為送審快照，`publishedRecap` 為已發布快照。請保留兩者與可編輯草稿的分離。
- 成果狀態：`draft → review → changes / approved → published`。
- 修改草稿不會改動已發布快照；發布新版後，示範知識同步狀態才重設。

## 明確限制

- 這是 Demo，沒有真正的伺服器端活動資料庫、檔案儲存或多使用者權限。
- Banner、照片與報名／問卷資料只存在操作時的同一瀏覽器，跨裝置或不同網址不會共用。
- 前後台拆分的是頁面與操作流程，並非正式安全權限邊界；後台標示未啟用角色驗證。
- 報名不寄送 Email，不包含支付、簽到或候補流程。
- 成果排版是依模板與手動文字組合，不會解讀照片內容或生成摘要。
- 影片僅作附件播放，不做逐字稿或自動剪輯。
- 正式 EXPERTHUB 知識庫尚未提供介面，目前不會實際匯入資料。
- OpenAI API 串接已移除，本包不包含 API server、金鑰讀取或 AI 呼叫。

若要正式上線，再依使用者需求接上後端、授權與儲存服務；這些不應視為本包已完成的能力。

## 延續原 Sites

現有 project ID：`appgprj_6ae7fe89ba38819191c7ba3dd2d2e5e2`。

沿用同一 Site 時，保留 `source/.openai/hosting.json` 的 ID 與私人受眾。不要另建同名 Site，也不要在未授權情況下改為公開。部署需由具備該 Site 權限的工具或帳號執行，本包不含部署憑證。


## 多活動架構（2026-11-02 新增）

- `localStorage` key 不變，內容改為 `{v:2,currentId,events:[...]}`；每個活動是一份原本的單活動 state，另有 `id`。舊版單活動資料會自動遷移為 `evt-ai-design`，並加入兩個範例活動。
- 全域 `state` 永遠指向「目前活動」；既有後台各頁與前台詳情邏輯維持原樣。`pickEvent(id)` 切換，`root` 為整份資料。
- 前台狀態由 `eventPhase()` 決定：`event.statusOverride`（auto／open／soon／ended）優先；否則活動結束後為 ended，未到 `event.regStart` 為 soon，其餘為 open。
- 前台 `/` 為活動列表（報名中／Coming soon／已結束）；`/?e=<id>` 為活動詳情；`/recap/?e=<id>` 為該活動成果頁。已結束活動優先顯示成果；Coming soon 沒有報名入口，也不顯示問卷與成果分頁。
- 後台新增「活動清單」與側邊欄活動切換；新增／複製／刪除活動。刪除不會清除 IndexedDB 內的素材檔。
- 問卷 QR 預設網址含 `e=<id>`。
