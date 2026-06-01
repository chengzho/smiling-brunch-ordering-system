# Smiling Brunch Ordering System

<p align="left">
  <img src="frontend/public/images/logo-mark.png" alt="Smiling Brunch Logo" width="90" />
</p>

Smiling Brunch Ordering System 是以早午餐店為情境設計的線上點餐與後台管理系統。
系統包含顧客前台點餐流程，以及管理員後台的菜單、訂單、分類、用戶與營運儀表板管理功能。

## 專案特色

- 顧客可瀏覽菜單、加入購物車、建立訂單與查看訂單紀錄
- 管理員可管理餐點、分類、訂單狀態與用戶帳號
- 後台提供營運儀表板，包含訂單狀態、熱銷餐點與常客排行
- 支援管理員帳號建立、停用與重新啟用
- 已加入帳號停用後的 session 驗證，停用帳號無法繼續使用系統
- 前台已加入基本 responsive layout，支援常見窄螢幕瀏覽

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- PHP
- RESTful API
- PHP Session

### Database

- MySQL
- XAMPP local environment

## 專案結構

```
restaurant-ordering/
├── api/              # PHP API endpoints
├── bootstrap.php     # Backend bootstrap
├── config/           # Database config example
├── database/         # SQL schema and seed data
├── frontend/         # React + TypeScript frontend
├── helpers/          # PHP helper functions
└── services/         # Backend service layer
```

## 主要功能

### 顧客前台

- 註冊 / 登入 / 登出
- 瀏覽菜單與分類篩選
- 搜尋餐點
- 查看餐點詳情
- 加入購物車
- 修改購物車數量
- 建立訂單
- 查看目前訂單與歷史訂單
- 查看訂單詳情
- 修改個人資料

### 管理員後台

- Dashboard 營運儀表板

- 菜單管理

  - 新增餐點
  - 編輯餐點
  - 上架 / 下架餐點

- 訂單管理

  - 查看所有訂單
  - 更新訂單狀態

- 分類管理

  - 新增分類
  - 編輯分類
  - 刪除分類
  - 查看分類下的餐點數量

- 用戶管理

  - 管理員與一般使用者分區顯示
  - 啟用 / 停用帳號
  - 新增管理員帳號
  - 防止停用自己
  - 防止停用最後一位啟用中的管理員

## 本地安裝與執行

## 1. Clone 專案

```
git clone git@github.com:chengzho/smiling-brunch-ordering-system.git
cd smiling-brunch-ordering-system
```

## 2. 建立資料庫

在 MySQL 中建立資料庫：

```
CREATE DATABASE restaurant_ordering_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

接著匯入：

```
database/schema.sql
database/init.sql
```

可以使用 phpMyAdmin 或 MySQL CLI 匯入。

## 3. 設定後端資料庫連線

複製範例設定檔：

```
cp config/db.example.php config/db.php
```

接著依照本機環境修改 `config/db.php`：

```
$host    = 'localhost';
$dbname  = 'restaurant_ordering_db';
$user    = 'root';
$pass    = '';
```

請注意：`config/db.php` 是本機設定檔，不會讓 Git 追蹤。

## 4. 安裝前端套件

```
cd frontend
npm install
```

## 5. 啟動前端開發伺服器

```
npm run dev
```

## 6. 啟動後端

使用 XAMPP 啟動：

- Apache
- MySQL

後端 API 位於：

```
http://localhost/restaurant-ordering/api
```

## Demo 帳號

### 管理員帳號

```
Email: admin@example.com
Password: admin123
```

### 測試使用者帳號

```
Email: customer@example.com
Password: user123
```

帳號僅供本地測試使用。
若要部署到正式環境，請務必更換預設管理員密碼。

## 資料庫檔案

- `database/schema.sql`：資料表結構
- `database/init.sql`：初始分類、餐點、測試帳號與 demo 訂單資料

## 注意事項

- 本專案主要用於課程專案與本地展示
- 後端使用 PHP Session 管理登入狀態
- 線上付款功能未串接第三方金流，目前採用現場付款流程
- `config/db.php` 不會上傳至 GitHub，請使用 `config/db.example.php` 建立本機設定

## 未來可擴充方向

- 線上付款串接
- 訂單通知功能
- 管理員操作紀錄
- 更完整的 RWD / mobile layout
- 商品庫存管理
- 密碼重設與 Email 驗證
