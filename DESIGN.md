# 迷你今日热榜 - 概要设计文档

## 文档信息

| 项目名称 | 迷你今日热榜 |
|---------|-------------|
| 文档版本 | V1.0 |
| 编写日期 | 2026-05-31 |
| 文档状态 | 初稿完成 |

---

## 1. 引言

### 1.1 编写目的

本概要设计文档旨在对"迷你今日热榜"项目进行系统层面的设计说明，为后续详细设计和编码实现提供指导依据。文档面向开发人员、测试人员和项目管理人员。

### 1.2 项目范围

本项目实现一个聚合微博、知乎、B站三大平台实时热搜的Web应用，包括：
- 前端展示页面（React + TypeScript）
- 后端API服务（Node.js + Express）
- 数据抓取与缓存机制

### 1.3 定义与缩写

| 术语 | 定义 |
|------|------|
| HotItem | 单条热搜数据结构 |
| HotPlatform | 单个平台的热榜数据结构 |
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| Hook | React 状态管理函数 |

---

## 2. 系统概述

### 2.1 系统目标

- 一站式聚合多平台实时热点
- 提供简洁直观的用户界面
- 支持响应式设计（桌面端 + 移动端）
- 实现高效的数据缓存机制

### 2.2 用户特征

| 用户类型 | 特征描述 |
|---------|---------|
| 普通用户 | 快速浏览各平台热点，无需注册登录 |
| 开发者 | 学习前后端分离架构、API设计 |

### 2.3 运行环境

| 环境 | 配置要求 |
|------|---------|
| 前端 | Node.js 18+, 现代浏览器 |
| 后端 | Node.js 18+, 端口 3001 |
| 网络 | 本地开发环境 / 公网部署 |

---

## 3. 系统架构设计

### 3.1 整体架构

采用前后端分离架构：

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                           │
│                   http://localhost:5173                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    前端应用层                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   App.tsx   │  │  HotCard    │  │   Layout    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │ useHotList  │  │  API Layer  │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/API
┌─────────────────────────────────────────────────────────┐
│                    后端服务层                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Express    │  │   Router    │  │   CORS      │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │ hotCrawler  │  │   Cache     │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    数据源层                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Mock Data   │  │  Real API   │  │   Cache     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术选型

| 层级 | 技术方案 | 选型理由 |
|------|---------|---------|
| 前端框架 | React 18 | 组件化开发、生态成熟 |
| 开发语言 | TypeScript | 类型安全、开发体验好 |
| 构建工具 | Vite | 快速构建、热更新 |
| 后端框架 | Express | 轻量级、易扩展 |
| 数据交互 | Fetch API | 原生支持、无需额外依赖 |
| 缓存方案 | 内存缓存 | 简单高效、适合小规模应用 |

### 3.3 系统边界

| 边界 | 说明 |
|------|------|
| 前端边界 | 用户界面展示、状态管理、API调用 |
| 后端边界 | 数据聚合、缓存管理、API提供 |
| 外部系统 | 各平台公开API（可选） |

---

## 4. 模块设计

### 4.1 前端模块

#### 4.1.1 模块划分

| 模块名称 | 功能描述 | 文件位置 |
|---------|---------|---------|
| App 模块 | 主页面入口、数据加载 | `src/App.tsx` |
| Layout 模块 | 顶栏 + 页脚布局 | `src/components/Layout.tsx` |
| HotCard 模块 | 单平台热搜卡片 | `src/components/HotCard.tsx` |
| API 模块 | 接口调用封装 | `src/api/hot.ts`, `src/api/fetchHot.ts` |
| Hook 模块 | 状态管理逻辑 | `src/hooks/useHotList.ts` |
| Types 模块 | 类型定义 | `src/types/hot.ts` |

#### 4.1.2 模块关系图

```
App.tsx
    │
    ├── Layout.tsx (布局容器)
    │       ├── Header (顶栏)
    │       └── Footer (页脚)
    │
    ├── HotCard.tsx × 3 (三个平台卡片)
    │       ├── Loading State (骨架屏)
    │       ├── Error State (错误提示)
    │       ├── Empty State (空数据)
    │       └── Success State (列表展示)
    │
    └── useHotList.ts (数据管理)
            │
            └── fetchHotList()
                    │
                    └── fetchAllHot() → /api/hot
```

#### 4.1.3 HotCard 状态设计

| 状态 | 触发条件 | UI表现 |
|------|---------|---------|
| loading | 数据请求中 | 骨架屏占位 |
| error | 请求失败 | 错误提示 + 重试按钮 |
| empty | items.length === 0 | "暂无数据"提示 |
| success | 数据正常返回 | 热搜列表 |

### 4.2 后端模块

#### 4.2.1 模块划分

| 模块名称 | 功能描述 | 文件位置 |
|---------|---------|---------|
| Server 模块 | Express 服务入口 | `server/server.js` |
| Router 模块 | API 路由定义 | `server/routes/hot.js` |
| Crawler 模块 | 数据抓取服务 | `server/services/hotCrawler.js` |
| Cache 模块 | 缓存管理 | `server/utils/cache.js` |
| Platform Services | 各平台数据服务 | `server/services/weibo.js`, `zhihu.js`, `bilibili.js` |

#### 4.2.2 模块关系图

```
server.js
    │
    ├── CORS Middleware (跨域处理)
    │
    ├── Logging Middleware (请求日志)
    │
    ├── Router Layer
    │       ├── GET /api/health
    │       ├── GET /api/hot
    │       ├── GET /api/hot/:source
    │       └── POST /api/hot/refresh
    │
    └── hotCrawler.js
            │
            ├── getHotData(source)
            │       ├── fetchWeiboHot() (可选真实数据)
            │       └── getMockData(source) (降级方案)
            │
            └── clearCache() (缓存清空)
```

---

## 5. 数据设计

### 5.1 数据结构定义

#### 5.1.1 HotItem（单条热搜）

```typescript
interface HotItem {
  rank: number;       // 排名（1-10）
  title: string;      // 热搜标题
  heat: string;       // 热度值（可选）
  url: string;        // 详情链接
}
```

#### 5.1.2 HotPlatform（平台热榜）

```typescript
interface HotPlatform {
  source: string;         // 平台标识（weibo/zhihu/bilibili）
  sourceName: string;     // 平台名称（微博/知乎/B站）
  listName: string;       // 榜单名称（实时热搜/热榜/热搜）
  updatedAt: string;      // 更新时间（ISO格式）
  items: HotItem[];       // 热搜列表
}
```

#### 5.1.3 ApiResponse（接口响应）

```typescript
interface ApiResponse {
  code: number;           // 状态码（200/404/500）
  msg: string;            // 消息
  platforms?: HotPlatform[];  // 平台数据（GET /api/hot）
  data?: HotPlatform[];       // 平台数据（GET /api/hot/:source）
  updateTime?: string;    // 更新时间
}
```

### 5.2 数据流设计

```
┌──────────────┐
│   用户请求    │
└──────────────┘
      │
      ▼
┌──────────────┐
│  useHotList  │  ← 触发数据加载
└──────────────┘
      │
      ▼
┌──────────────┐
│ fetchAllHot  │  ← 调用 API
└──────────────┘
      │
      ▼ HTTP GET /api/hot
┌──────────────┐
│  Vite Proxy  │  ← 开发环境代理
└──────────────┘
      │
      ▼
┌──────────────┐
│ Express API  │  ← 后端路由
└──────────────┘
      │
      ▼
┌──────────────┐
│ hotCrawler   │  ← 数据获取
└──────────────┘
      │
      ├── Cache Hit → 返回缓存数据
      │
      └── Cache Miss → 获取新数据
              │
              ├── Real API (可选)
              │
              └── Mock Data (降级)
      │
      ▼
┌──────────────┐
│ 返回 JSON    │  ← { platforms: [...] }
└──────────────┘
```

### 5.3 缓存设计

| 参数 | 配置值 | 说明 |
|------|-------|------|
| 缓存时长 | 600秒（10分钟） | 可通过环境变量 `CACHE_TTL` 配置 |
| 缓存存储 | 内存对象 | Node.js 进程内存 |
| 缓存键 | `hot_weibo`, `hot_zhihu`, `hot_bilibili` | 各平台独立缓存 |
| 刷新机制 | POST /api/hot/refresh | 清空所有缓存 |
| 强制刷新 | `?refresh=1` 参数 | 跳过缓存获取新数据 |

---

## 6. 接口设计

### 6.1 API 接口列表

| 接口路径 | 方法 | 功能 | 请求参数 | 响应格式 |
|---------|------|------|---------|---------|
| `/api/health` | GET | 健康检查 | 无 | `{ ok: true }` |
| `/api/hot` | GET | 获取所有热榜 | 无 | `{ platforms: [...] }` |
| `/api/hot/:source` | GET | 获取单平台热榜 | source: weibo/zhihu/bilibili | `{ data: [...] }` |
| `/api/hot/refresh` | POST | 清空缓存 | 无 | `{ msg: "缓存已清空" }` |

### 6.2 接口详细设计

#### 6.2.1 GET /api/hot

**请求示例：**
```http
GET /api/hot HTTP/1.1
Host: localhost:3001
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "请求成功",
  "platforms": [
    {
      "source": "weibo",
      "sourceName": "微博",
      "listName": "实时热搜",
      "updatedAt": "2026-05-31T07:03:27.615Z",
      "items": [
        { "rank": 1, "title": "热搜标题", "heat": "8562000", "url": "#" }
      ]
    }
  ],
  "updateTime": "2026-05-31T07:03:27.756Z"
}
```

#### 6.2.2 GET /api/hot/:source

**请求示例：**
```http
GET /api/hot/weibo HTTP/1.1
Host: localhost:3001
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "请求成功",
  "data": [
    {
      "source": "weibo",
      "sourceName": "微博",
      "listName": "实时热搜",
      "updatedAt": "2026-05-31T07:03:27.615Z",
      "items": [...]
    }
  ]
}
```

**错误响应：**
```json
{
  "code": 404,
  "msg": "不支持的平台: invalid",
  "data": []
}
```

### 6.3 前端接口封装

```typescript
// src/api/hot.ts
export async function fetchHotPlatform(source: string): Promise<ApiResponse> {
  const response = await fetch(`/api/hot/${source}`);
  return response.json();
}

export async function fetchAllHot(): Promise<ApiResponse> {
  const response = await fetch('/api/hot');
  return response.json();
}
```

---

## 7. 安全设计

### 7.1 CORS 配置

```javascript
// server/server.js
app.use(cors({
  origin: 'http://localhost:5173',  // 仅允许前端域名
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 7.2 安全措施

| 安全项 | 实现方式 |
|--------|---------|
| 跨域限制 | CORS 白名单配置 |
| 请求日志 | 记录所有请求路径和时间 |
| 错误处理 | 统一错误响应格式 |
| 数据验证 | source 参数校验 |

### 7.3 合规说明

- 数据来源于各平台公开接口
- 页面标注免责声明
- 仅用于学习演示，非商用

---

## 8. 性能设计

### 8.1 性能指标

| 指标 | 目标值 |
|------|-------|
| 页面加载时间 | < 2秒 |
| API 响应时间 | < 500ms |
| 首屏渲染时间 | < 1秒 |

### 8.2 性能优化措施

| 优化项 | 实现方式 |
|--------|---------|
| 缓存机制 | 60秒缓存，减少重复请求 |
| 骨架屏 | 加载状态优化用户体验 |
| 按需加载 | React 组件懒加载（可选） |
| 静态资源 | Vite 构建优化 |

### 8.3 缓存策略

```
请求到达
    │
    ├── 检查缓存是否存在
    │       │
    │       ├── 存在且未过期 → 返回缓存数据
    │       │
    │       └── 不存在或已过期 → 获取新数据
    │               │
    │               ├── 存入缓存
    │               │
    │               └── 返回新数据
```

---

## 9. 部署设计

### 9.1 开发环境

| 服务 | 端口 | 启动命令 |
|------|------|---------|
| 前端 | 5173 | `cd client && npm run dev` |
| 后端 | 3001 | `cd server && npm run dev` |

### 9.2 生产环境

| 服务 | 推荐平台 | 构建命令 |
|------|---------|---------|
| 前端 | Vercel / Netlify | `npm run build` |
| 后端 | Railway / Render | 直接部署 |

### 9.3 环境变量

```env
# .env.production
VITE_API_BASE=https://your-api-domain.com
```

---

## 10. 扩展设计

### 10.1 未来扩展点

| 扩展项 | 设计方案 |
|--------|---------|
| 新增平台 | 扩展 hotCrawler.js，添加新 source |
| 真实数据 | 实现各平台 API 抓取逻辑 |
| 搜索功能 | 添加搜索组件和过滤逻辑 |
| 历史记录 | 引入数据库存储 |
| PWA 支持 | 添加 Service Worker |

### 10.2 模块扩展接口

```typescript
// 新增平台示例
const newPlatform = {
  source: 'douyin',
  sourceName: '抖音',
  listName: '热搜',
  fetchFunction: fetchDouyinHot,  // 新增抓取函数
  mockData: douyinMockData        // 新增 Mock 数据
};
```

---

## 11. 附录

### 11.1 文件清单

| 文件 | 路径 | 说明 |
|------|------|------|
| App.tsx | `client/src/App.tsx` | 主页面 |
| Layout.tsx | `client/src/components/Layout.tsx` | 布局组件 |
| HotCard.tsx | `client/src/components/HotCard.tsx` | 热搜卡片 |
| hot.ts | `client/src/api/hot.ts` | API 接口 |
| fetchHot.ts | `client/src/api/fetchHot.ts` | 数据获取 |
| useHotList.ts | `client/src/hooks/useHotList.ts` | 数据 Hook |
| hot.ts | `client/src/types/hot.ts` | 类型定义 |
| server.js | `server/server.js` | Express 服务 |
| hotCrawler.js | `server/services/hotCrawler.js` | 数据抓取 |

### 11.2 参考资料

- React 官方文档: https://react.dev
- Express 官方文档: https://expressjs.com
- Vite 官方文档: https://vitejs.dev
- TypeScript 官方文档: https://www.typescriptlang.org

---

**文档结束**