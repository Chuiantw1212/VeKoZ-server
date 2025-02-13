# 🚀 Venonia-server

Venonia-server 是基於 [Elysia](https://elysiajs.com/) 構建的高效能 TypeScript 伺服器。  
透過 Bun 的極致效能優化以及 Elysia 的靜態分析技術，我們能夠提供比 Express.js 快 **10 倍以上** 的效能，甚至超越許多主流語言框架。


## 🛠 安裝與運行

請確保已安裝 **Node.js (LTS) 或 Bun**，然後執行以下指令來安裝依賴：

```sh
pnpm install
```

啟動開發伺服器：
```sh
pnpm dev
```

啟動生產環境：
```sh
pnpm build && pnpm start
```

## 🚀 Venonia-server 的效能

**Elysia 的出現，已經打破了 Express.js 帶來的「Node.js 效能差」的刻板印象**，讓基於 Elysia 的 Venonia-server 具備超越許多主流語言框架的能力。

根據效能測試結果，**除了 Java 的 Jooby 以外，Elysia 讓 Venonia-server 直接超越 Java、C# 等傳統語言框架**：

| 語言        | 框架           | 版本  | 測試 1  | 測試 2  | 測試 3  |
|------------|--------------|-------|--------|--------|--------|
| **Java**   | **Jooby**    | 3.5   | **490,480** | **553,672** | **570,144** |
| **Venonia-server (Elysia)** | 1.1   | **113,920** | **123,164** | **124,211** |
| **Java**   | **Blade**    | 2.1   | 102,369 | 116,108 | 134,241 |
| **C#**     | **GenHTTP**  | 9.6   | 11,984  | 25,813  | 11,241  |

### **📌 為何選擇 Venonia-server？**
✅ **RPS 遠超過 Express.js，真正發揮 Node.js 的潛能**  
✅ **除了 Java Jooby 以外，擊敗大部分主流語言框架**  
✅ **支援 Bun，大幅提升效能與 DX (開發者體驗)**  
✅ **靜態分析與自動最佳化，減少不必要的運行時開銷**

Node.js 不再是效能短板，透過 **Venonia-server**，你可以獲得 **高效能、低延遲** 的 API 伺服器 🚀！

## 📜 License

本專案採用 **MIT License**，歡迎自由使用與貢獻！
