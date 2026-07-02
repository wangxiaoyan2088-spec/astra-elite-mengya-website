# AstraElite AI Learning Game Engine - Phase 1

当前实现是静态站可运行版本，目标是先稳定落地 Phase 1：

- `/game/index.html`：Game Hub / 世界地图
- `/game/ep01/index.html`：EP01 关卡世界
- `/game/ep02/index.html`：EP02 关卡世界预览
- `/game/ep01/boss/index.html`：EP01 AI Boss Battle

## 数据层

- `/data/ep_worlds.json`
- `/data/ep01_nodes.json`
- `/data/boss_configs.json`
- `/data/game_data.js`

说明：`.json` 是目标数据源；`game_data.js` 是为了兼容本地 `file://` 打开时浏览器不能稳定 fetch 本地 JSON 的限制。

## 引擎层

- `/game-engine.js`：当前可运行的静态游戏引擎
- `/components/GameEngine.ts`：未来 Next.js 迁移用核心类型和判定函数
- `/components/GameWorldMap.tsx`
- `/components/EPNode.tsx`
- `/components/PlayerHUD.tsx`
- `/components/BossAIChat.tsx`

## Phase 1 已完成

- 世界地图节点渲染
- EP 状态：locked / unlocked / completed
- 玩家 HUD：Level / XP / AI Energy / Skills
- EP 节点系统：Story / Learning / AI Challenge / Boss / Reward
- EP01 Boss 对话战斗原型
- XP / Energy / completed progress 使用 localStorage 保存

## 后续迁移目标

Next.js App Router 目标路径：

- `/app/game/page.tsx`
- `/app/game/[ep]/page.tsx`
- `/app/game/[ep]/boss/page.tsx`
- `/components/*`
- `/data/*`

迁移时保留现有数据结构即可。
