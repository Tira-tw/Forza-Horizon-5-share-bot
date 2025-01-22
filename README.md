# Forza Horizon 5 Discord Bot

## 介紹
這是一個用於 **Forza Horizon 5** 的 Discord 機器人，提供以下功能：
- 註冊玩家資料
- 搜尋玩家資訊
- 分享調校代碼
- 發布與查看拍賣資訊

### 功能列表
1. `/register`
   - 註冊玩家資料，包括名字、頭像、封面照片與介紹。

2. `/search_player`
   - 搜尋已註冊玩家的詳細資料。

3. `/share_tuning`
   - 分享調校代碼，並將訊息發佈至特定的調校頻道。

4. `/auction`
   - 發布拍賣資訊，並將訊息發佈至特定的拍賣頻道。

5. `/auction_list`
   - 查看所有目前正在拍賣的車輛資訊。

---

## 安裝

### 需求環境
- Node.js (推薦版本：18 或以上)
- npm (隨附於 Node.js)

### 安裝步驟
1. **Clone 專案到本地端**：
   ```bash
   git clone <你的專案網址>
   cd <專案資料夾名稱>
   ```

2. **安裝所需套件**：
   ```bash
   npm install discord.js dotenv
   ```

3. **設定環境變數**：
   在專案根目錄下創建 `.env` 文件，並填入以下內容：
   ```env
   TOKEN=你的Discord機器人Token
   CLIENT_ID=你的應用程式ID
   GUILD_ID=你的伺服器ID
   TUNING_CHANNEL_ID=分享調校頻道ID
   AUCTION_CHANNEL_ID=拍賣頻道ID
   ```

---

## 使用

### 啟動機器人
在終端執行以下指令來啟動機器人：
```bash
node .
```

### 開發模式
如需在開發時自動重啟機器人，可以使用 `nodemon`：
```bash
npx nodemon .
```

---

## 範例指令

### 註冊
```bash
/註冊 名字:<名字> 頭像:<圖片URL> 封面照片:<圖片URL> 介紹:<簡短自我介紹>
```

### 搜尋玩家
```bash
/搜尋玩家 名字:<玩家名字>
```

### 分享調校
```bash
/分享調校 車名:<車輛名稱> 分享代碼:<代碼> 建立者:<你的名字>
```

### 發布拍賣
```bash
/拍賣 車名:<車輛名稱> 起標價:<金額> 直購價:<金額> 拍賣時間:<時長> Xbox玩家名字:<名稱>
```

### 查看拍賣場
```bash
/拍賣場
```

---

## 貢獻
如果想對本專案進行改進，歡迎提交 Pull Request！

---

## 授權
本專案採用 MIT 授權。詳情請參閱 [LICENSE](./LICENSE)。

