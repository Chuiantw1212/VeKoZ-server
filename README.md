# 🚀 Venonia-server

Venonia-server 是基於 [Elysia](https://elysiajs.com/) 構建的高效能 TypeScript 伺服器。  
透過 Bun 的極致效能優化以及 Elysia 的靜態分析技術，我們能夠提供比 Express.js 快 **10 倍以上** 的效能，甚至超越許多主流語言框架。

- **Elysia 官方網站**：[Elysia.js](https://elysiajs.com/)  
- **Elysia GitHub 資料夾**：[elysiajs/elysia](https://github.com/elysiajs/elysia)  
- **效能評測結果**：[Web Frameworks Benchmark](https://web-frameworks-benchmark.netlify.app/result?asc=0&f=elysia&l=java,csharp,rust,go,ruby,python,javascript,php&order_by=level64)

## 🛠 安裝與運行

請確保已安裝 **Node.js (LTS) 或 Bun**，然後執行以下指令來安裝依賴：

```sh
pnpm install
```

啟動開發伺服器：
```sh
pnpm dev
```

## 🚀 為何關注 RPS（Requests Per Second）？

在討論 Web 框架的效能時，完整的效能評估還需要考慮資料庫、檔案存取、背景任務等因素。然而，**對於前後端分離架構、使用大量 PATCH 請求、無需等待回應的 API 設計，RPS 是最重要的效能指標**。  

### **為什麼 RPS 重要？**
✅ **適用於高併發的 API（如 RESTful API、GraphQL、WebSocket）**  
✅ **對於無狀態（Stateless）應用，如微服務架構，RPS 直接反映伺服器吞吐量**  
✅ **在 Edge Computing、Serverless 架構下，RPS 影響可擴展性與成本優化**  

因此，在這類應用場景中，**Venonia-server 透過 Elysia 提供極高的 RPS，讓 API 具備更強的負載能力與低延遲響應**。

## 🚀 Venonia-server 的 RPS 效能

根據 [Web Frameworks Benchmark](https://web-frameworks-benchmark.netlify.app/result?asc=0&f=elysia&l=java,csharp,rust,go,ruby,python,javascript,php&order_by=level64) 測試結果，**除了 Java 的 Jooby 以外，Elysia 讓 Venonia-server 直接超越 Rust、C#、Go、Ruby、Python、PHP 等傳統語言框架**，在 RPS 指標上擁有絕對優勢：

| 語言        | 框架        | 版本  | RPS(64)   | RPS(256)  | RPS(512)  |
|------------|------------|--------|-----------|-----------|-----------|
| **Java**   | **Jooby**  | 3.5    | **490,480** | **553,672** | **570,144** |
| **Node.js** | **Elysia** | 1.1    | **113,920** | **123,164** | **124,211** |
| **Java**   | **Blade**  | 2.1    | 102,369    | 116,108    | 134,241    |
| **Rust**   | **Actix**  | 1.84   | 8,805      | 41,883     | 54,430     |
| **C#**     | **ASP.NET MVC** | 12 | 7,010      | 9,829      | 6,775      |
| **Go**     | **Fiber**  | 1.23   | 3,788      | 6,164      | 8,229      |
| **Ruby**   | **Rails**  | 3.4    | 2,901      | 3,091      | 2,859      |
| **Python** | **Django** | 3.13   | 2,820      | 2,636      | 3,575      |
| **Node.js** | **Express** | 4.21  | 2,725      | 2,894      | 2,998      |
| **PHP**    | **Laravel** | 8.4   | 2,192      | 2,320      | 2,140      |

### **📌 為何選擇 Venonia-server？**
✅ **專為前後端分離、高併發 API 設計，RPS 是最關鍵的效能指標**  
✅ **比 Rust (Actix) 高出 **2 倍**，甚至超越 C# (ASP.NET MVC)、Go (Fiber)**  
✅ **支援 Bun，大幅提升效能與 DX (開發者體驗)**  
✅ **比 Python Django 快 **40 倍**，比 PHP Laravel 快 **50 倍**，比 Ruby on Rails 快 **40 倍**  
✅ **RPS 高代表 API 呼叫的極限負載更大，適用於高頻請求、批次處理、非同步工作流**  

Node.js 不再是效能短板，透過 **Venonia-server**，你可以獲得 **高 RPS、低延遲、高吞吐** 的 API 伺服器 🚀！

## 📜 License

本專案採用 **MIT License**，歡迎自由使用與貢獻！
