# PWA URL 生成器

這是一個簡化的單頁應用，只包含「生成 PWA URL」按鈕功能。

## 功能說明

- 點擊「生成 PWA URL」按鈕
- 生成加密的 Token 並儲存到資料庫
- 自動從資料庫取得所有 PWA type 的 URLs
- 顯示帶有 Token 參數的完整 URL
- 提供一鍵複製功能

## 資料庫需求

需要兩個資料表：

### Table: `urls`

| 欄位名稱 | 型態          | 說明           |
| -------- | ------------- | -------------- |
| id       | int AI PK     | 主鍵，自動遞增 |
| type     | varchar(64)   | 類型（pwa）    |
| url      | varchar(2048) | 網址           |
| status   | varchar(64)   | 狀態           |

### Table: `tokens`

| 欄位名稱   | 型態       | 說明           |
| ---------- | ---------- | -------------- |
| id         | int AI PK  | 主鍵，自動遞增 |
| token      | text       | 加密的 token   |
| enabled    | varchar(8) | 是否啟用       |
| created_at | timestamp  | 建立時間       |

## 環境變數設定

請在專案根目錄建立 `.env` 檔案，內容如下：

```
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
TOKEN_SECRET_KEY=your_secret_key_for_encryption
TOKEN_DOCUMENT=your_document_to_encrypt
PORT=3000
```

## 安裝與啟動

1. 安裝依賴：
   ```bash
   npm install
   ```

2. 設定環境變數（建立 `.env` 檔案）

3. 啟動伺服器：
   ```bash
   npm start
   ```

4. 於瀏覽器開啟 http://localhost:3000

## 使用方式

1. 點擊「生成 PWA URL」按鈕
2. 確認生成操作
3. 查看生成的 Token 和 PWA URLs
4. 點擊「Copy」按鈕複製完整 URL（包含 Token 參數）

