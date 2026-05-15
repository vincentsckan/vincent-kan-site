# 設定你的 Secrets（GitHub Actions Secrets）

要啟用自動社交媒體發布，你需要設定以下 GitHub Secrets。

## 如何設定

1. 去 https://github.com/vincentsckan/vincent-kan-site/settings/secrets/actions
2. 點擊 "New repository secret"
3. 逐一加入以下 secrets

---

## 🔑 需要的 Secrets

### Telegram (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`)

1. 去 Telegram 搜尋 `@BotFather`
2. 發送 `/newbot` 建立一個新 bot
3. 複製 token（類似 `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）
4. 加到 secret: `TELEGRAM_BOT_TOKEN`
5. 將 bot 加入你的頻道，發一條訊息
6. 去 `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` 獲取 chat_id
7. 加到 secret: `TELEGRAM_CHAT_ID`

### Reddit (`REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` + `REDDIT_USERNAME` + `REDDIT_PASSWORD`)

1. 去 https://www.reddit.com/prefs/apps
2. 點擊 "Create App" → 選 "script"
3. 名稱: `DisclosureHK`
4. redirect uri: `http://localhost:8080`
5. 複製下方的 client ID 和 secret
6. 加到 secrets

### OpenRouter (`OPENROUTER_API_KEY`)

必要！UFO新聞引擎需要佢。
- 如果未加，去 https://openrouter.ai/keys 獲取
- 加到 secret: `OPENROUTER_API_KEY`

---

## 📋 Secrets 清單總表

| Secret Name | Required For | Status |
|---|---|---|
| `OPENROUTER_API_KEY` | UFO News Engine | ✅ 已設 (如新聞生成正常) |
| `TELEGRAM_BOT_TOKEN` | Auto-post to Telegram | ⬜ 未設 |
| `TELEGRAM_CHAT_ID` | Auto-post to Telegram | ⬜ 未設 |
| `REDDIT_CLIENT_ID` | Auto-post to Reddit | ⬜ 未設 |
| `REDDIT_CLIENT_SECRET` | Auto-post to Reddit | ⬜ 未設 |
| `REDDIT_USERNAME` | Auto-post to Reddit | ⬜ 未設 |
| `REDDIT_PASSWORD` | Auto-post to Reddit | ⬜ 未設 |

---

## ✅ 設定完成後

全部設定好之後，GitHub Actions 會自動：

- **每日 09:30 HKT 和 21:30 HKT** → 自動發 X/Twitter + Telegram
- **每日 11:00 HKT 和 23:00 HKT** → 自動發 Reddit (r/UFOs, r/UAP, r/UFObelievers 輪流)
- **每 4 小時** → UFO News Engine 自動生成新聞摘要
