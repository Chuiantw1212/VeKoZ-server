# 架構說明

1. 一個.model.ts只會對應一個collection，目的在於整合各種資料存儲
2. Service主要放商業邏輯
3. model + service 功能要明確區分

## Models

需要明確具備CRUD功能。

## DataAccess

1. 內部成員全部使用protected，避免service除了商業邏輯也要處理資料邏輯。
2. 不知道要傳什麼就傳資料數量