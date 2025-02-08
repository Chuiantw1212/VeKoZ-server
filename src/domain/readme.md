# 架構說明
1. 一個.model.ts只會對應一個collection，目的在於整合各種資料存儲
2. Service主要放商業邏輯
3. model + service 功能要明確區分

## Models
1. 一律用super去存取父層繼承來的methods，維護比較容易