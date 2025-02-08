# Services 服務
1. 主要把商業邏輯放在這邊。
2. Service要以商業作為切分單位。所以會把EventTemplate以及EventTemplateDesign合併一起。
3. model, service區隔開為了應對資料交互，讓controller盡可能單純，只對API所需要的參數負責。

## DDD的解釋
1. Service往往是以一個活動來命名，而不是以一個Entity來命名。
2. 經過長時間的迭代，service與model會不可避免的有混亂的對應關係。

## 個人見解 
1. 如果嚴謹使用RESTUFUL的API設計，很自然一個Entiry.service底下的method就是DDD中Service的用法，保持一個api對到一個service.method的原則。
2. 只要restful api的設計原則嚴格把控，很難出現service與model產生混亂對應的狀況。