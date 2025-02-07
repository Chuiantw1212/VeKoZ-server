# Services 服務
1. 主要把商業邏輯放在這邊。
2. Service要以商業作為切分單位。所以會把EventTemplate以及EventTemplateDesign合併一起。

## DDD的解釋
Service往往是以一個活動來命名，而不是以一個Entity來命名。

## 個人見解 
如果嚴謹使用RESTUFUL的API設計，很自然一個Entiry.service底下的method就是DDD中Service的用法，保持一個api對到一個service.method的原則。
