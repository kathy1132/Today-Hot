# 迷你今日热榜

一站式聚合微博、知乎、B站实时热点的学习项目。

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 功能特性

- ✅ 聚合微博、知乎、B站三大平台热榜
- ✅ 实时数据更新（支持缓存机制）
- ✅ 响应式设计，支持桌面端和移动端
- ✅ 前三名热搜特殊样式强调
- ✅ 骨架屏加载状态
- ✅ 错误状态与重试机制

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 后端 | Node.js + Express |
| 数据 | API 接口 + 缓存机制 |
| 样式 | CSS（无 Tailwind） |

## 项目结构

```
.
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── Layout.tsx     # 全局布局
│   │   │   └── HotCard.tsx    # 热搜卡片
│   │   ├── api/               # API 接口
│   │   │   ├── hot.ts         # 热榜接口
│   │   │   └── fetchHot.ts    # 数据获取（统一封装）
│   │   ├── hooks/             # 自定义 Hooks
│   │   │   └── useHotList.ts  # 热榜数据 Hook
│   │   ├── types/             # 类型定义
│   │   │   └── hot.ts         # 热榜类型
│   │   ├── mock/              # Mock 数据（备份）
│   │   │   └── hot.json       # 模拟数据
│   │   ├── tests/             # 测试文件
│   │   │   └── useHotList.test.ts
│   │   ├── App.tsx            # 主页面
│   │   ├── App.css            # 样式文件
│   │   └── main.tsx           # 入口文件
│   ├── .env.development       # 开发环境变量
│   ├── .env.production        # 生产环境变量
│   ├── vite.config.ts         # Vite 配置（含代理）
│   ├── package.json
│   └── tsconfig.json
│
├── server/                    # 后端项目
│   ├── services/
│   │   ├── hotCrawler.js      # 数据抓取与缓存服务
│   │   ├── weibo.js           # 微博热搜服务（真实API）
│   │   ├── zhihu.js           # 知乎热榜服务（真实API）
│   │   └── bilibili.js        # B站热搜服务（真实API，降级到Mock）
│   ├── utils/
│   │   └── cache.js           # 缓存工具
│   ├── routes/
│   │   └── hot.js             # 热榜路由
│   ├── tests/                 # 测试文件
│   │   └── api.test.js
│   ├── .env                   # 环境变量（不上传git）
│   ├── server.js              # Express 服务（主入口）
│   ├── index.js               # Express 服务（备用入口）
│   └── package.json
│
├── .gitignore                 # Git 忽略配置
├── PRD.md                     # 产品需求文档
├── DESIGN.md                  # 设计文档
├── TECH_DESIGN.md             # 技术设计文档
├── AGENTS.md                  # 智能体配置
├── DEPLOYMENT_CHECKLIST.md    # 部署检查表
├── TEST_CASES.md              # 测试用例
└── README.md                  # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
# 方式一：分别安装（推荐用于开发）
cd client && npm install
cd ../server && npm install

# 方式二：使用根目录脚本一键安装
cd Today-Hot
npm run install:all
```

### 2. 启动开发服务器

**方式一：使用根目录脚本（推荐）**

```bash
# 在项目根目录
cd Today-Hot

# 同时启动前后端
npm run dev

# 或单独启动
npm run dev:client   # 启动前端（端口 5173）
npm run dev:server   # 启动后端（端口 3001）
```

**方式二：使用两个终端**

```bash
# 终端 1 - 启动前端（端口 5173）
cd client
npm run dev

# 终端 2 - 启动后端（端口 3001）
cd server
npm run start
```

### 3. 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:5173 | React 开发服务器 |
| 后端接口 | http://localhost:3001 | Express API 服务 |
| 健康检查 | http://localhost:3001/api/health | 服务状态检测 |

## API 接口文档

### 基础接口

| 接口 | 方法 | 说明 | 返回格式 |
|------|------|------|---------|
| `/api/health` | GET | 健康检查 | `{ ok: true }` |
| `/api/hot` | GET | 获取所有平台热榜 | `{ platforms: [...] }` |
| `/api/hot/refresh` | POST | 清空缓存 | `{ msg: "缓存已清空" }` |

### 平台接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/hot/weibo` | GET | 获取微博热搜（10条） |
| `/api/hot/zhihu` | GET | 获取知乎热榜（10条） |
| `/api/hot/bilibili` | GET | 获取B站热搜（10条） |

### 返回数据格式

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
        { "rank": 1, "title": "热搜标题", "heat": "热度值", "url": "链接" }
      ]
    }
  ],
  "updateTime": "2026-05-31T07:03:27.756Z"
}
```

## 数据来源

热榜数据通过后端服务调用各平台公开 API 获取：

| 平台 | 数据来源 | 接口 | 状态 |
|------|---------|------|------|
| 微博 | 真实 API | `https://weibo.com/ajax/side/hotSearch` | ✅ 已接入 |
| 知乎 | 真实 API | `https://api.zhihu.com/topstory/hot-list` | ✅ 已接入 |
| B站 | 真实 API（失败时降级到 Mock） | `https://api.bilibili.com/x/web-interface/ranking/v2` | ⚠️ 部分可用 |

**降级机制**：
- B站 API 因反爬虫机制可能返回错误（错误码 -352）
- API 请求失败时自动降级到 Mock 数据
- 确保页面始终可正常显示

后端服务提供统一的热榜聚合接口：
- `GET /api/hot` - 获取所有平台热榜数据

> ⚠️ 本项目为技术学习演示项目，数据仅供学习参考，非商用。

## 前端架构

### 数据流

```
App.tsx
  ↓
useHotList() Hook
  ↓
fetchHotList() → fetchAllHot()
  ↓
/api/hot（通过 Vite Proxy）
  ↓
后端 Express 服务
  ↓
返回 platforms 数据
```

### 组件说明

| 组件 | 文件 | 功能 |
|------|------|------|
| Layout | `Layout.tsx` | 顶栏 + 页脚布局 |
| HotCard | `HotCard.tsx` | 单平台热搜卡片（支持 loading/error/empty 状态） |
| App | `App.tsx` | 主页面，渲染三个 HotCard |

### 状态管理

- `useHotList` Hook 管理全局数据状态
- 支持 `loading`、`error`、`refetch` 操作
- 500ms 模拟延迟（可移除）

## 后端架构

### 服务结构

```
server.js              # Express 路由与中间件
  ↓
hotCrawler.js          # 数据抓取与缓存调度
  ↓
weibo.js               # 微博热搜服务
zhihu.js               # 知乎热榜服务
bilibili.js            # B站热搜服务
  ↓
cache.js               # 内存缓存（TTL 600秒）
```

### 缓存机制

- **缓存时长**：600 秒（10分钟，可通过环境变量 `CACHE_TTL` 配置）
- **缓存存储**：内存对象
- **缓存 Key**：`hot_weibo`、`hot_zhihu`、`hot_bilibili`（独立缓存）
- **刷新接口**：`POST /api/hot/refresh`
- **强制跳过缓存**：请求添加 `?refresh=1` 参数

## 常见问题

### 端口占用

**问题**: 端口 5173 或 3001 被占用

**Windows PowerShell 解决方案**:

```powershell
# 查找占用端口的进程
netstat -ano | findstr ":5173"
netstat -ano | findstr ":3001"

# 停止占用进程（替换 PID）
Stop-Process -Id <PID> -Force
```

**Linux/Mac 解决方案**:

```bash
# 查找并杀死进程
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### 代理不生效

**问题**: 前端请求 `/api` 无法代理到后端

**检查步骤**:

1. 确认后端服务已启动
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 检查 `client/vite.config.ts` 代理配置：
   ```typescript
   server: {
     port: 5173,
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       }
     }
   }
   ```

3. 重启前端开发服务器

### 跨域问题

**问题**: CORS 错误

**解决方案**: 后端已配置 CORS，允许 `http://localhost:5173`。如需添加其他域名：

```javascript
// server/server.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://your-domain.com'],
}));
```

### 数据加载失败

**问题**: 前端显示"数据加载失败"

**排查步骤**:

1. 检查后端服务状态
2. 检查浏览器控制台网络请求
3. 确认 `/api/hot` 返回正确数据格式
4. 检查 `fetchHot.ts` 是否正确解析 `platforms` 字段

## 生产环境部署

### 根目录脚本说明

项目根目录 `package.json` 提供统一的启动脚本：

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 使用 concurrently 同时启动前端和后端 |
| `npm run dev:client` | 仅启动前端开发服务器 |
| `npm run dev:server` | 仅启动后端服务器 |
| `npm run build:client` | 构建前端生产版本 |
| `npm run build` | 同 build:client |
| `npm run start` | 启动后端生产服务器 |
| `npm run install:all` | 安装所有依赖（根目录 + client + server） |

### 前端构建

```bash
cd client
npm run build
# 构建产物在 dist/ 目录
```

### 环境变量配置

**前端环境变量**:

| 文件 | 环境 | 用途 |
|------|------|------|
| `.env.development` | 开发环境 | `VITE_API_BASE=/api`（通过 Vite 代理） |
| `.env.production` | 生产环境 | `VITE_API_BASE=https://your-api-domain.com` |

**后端环境变量** (`server/.env`):

```env
NODE_ENV=development
ALLOW_ORIGIN=http://localhost:5173
CACHE_TTL=600000
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `ALLOW_ORIGIN` | 允许的前端域名 | `http://localhost:5173` |
| `CACHE_TTL` | 缓存时长（毫秒） | `600000`（10分钟） |
| `PORT` | 服务端口 | `3001` |

### API 调用配置

`client/src/api/fetchHot.ts` 使用统一的环境变量：

```typescript
const baseUrl = import.meta.env.VITE_API_BASE;

export async function fetchAllHot() {
  const res = await fetch(`${baseUrl}/hot`);
  return res.json();
}

export async function fetchSingleHot(source: string) {
  const res = await fetch(`${baseUrl}/hot/${source}`);
  return res.json();
}
```

### Render 部署指南

#### 后端部署（Render）

Render 提供免费的后端托管服务，部署步骤如下：

1. **创建新服务**
   - 登录 [Render Dashboard](https://dashboard.render.com/)
   - 点击 "New +" → "Web Service"
   - 连接你的 GitHub 仓库，选择 `Today-Hot` 项目

2. **配置服务设置**
   - **Name**: `mini-hot-hub`（自定义）
   - **Region**: 选择离你最近的区域（如 `Singapore`）
   - **Branch**: `main`
   - **Root Directory**: 留空（项目根目录）
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`

3. **配置环境变量**
   - 在 "Environment" 标签页添加以下变量：
     ```
     NODE_ENV=production
     PORT=3001
     ALLOW_ORIGIN=https://your-frontend-domain.vercel.app
     CACHE_TTL=600000
     ```

4. **配置实例类型**
   - **Instance Type**: 选择 "Free"（免费套餐）
   - 免费套餐会自动休眠，首次访问需要唤醒（约 30 秒）

5. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成（约 2-5 分钟）
   - 获取 Render 分配的域名：`https://mini-hot-hub-xxxx.onrender.com`

#### 前端部署（Vercel）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库 `Today-Hot`
4. 配置构建设置：
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`（⚠️ **重要**：必须设置为 `client`）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. 添加环境变量：
   ```
   VITE_API_BASE=https://mini-hot-hub-xxxx.onrender.com/api
   ```

6. 点击 "Deploy" 开始部署

### ⚠️ Vercel 部署注意事项

如果遇到 `Cannot find module '@rollup/rollup-linux-x64-gnu` 错误：

**解决方案：**
1. 在 Vercel 项目设置中，确认 **Root Directory** 设置为 `client`
2. 删除 Vercel 部署记录，重新部署
3. 确保 Git 仓库中没有提交 `node_modules` 目录

**检查清单：**
- [ ] Root Directory 设置为 `client`（不是根目录）
- [ ] `.gitignore` 已正确配置，`node_modules/` 被忽略
- [ ] Git 仓库中没有 `node_modules` 目录

### 部署建议

| 平台 | 推荐服务 | 说明 |
|------|---------|------|
| 前端 | Vercel | 免费、快速、自动 HTTPS |
| 后端 | Render | 免费套餐、支持 Node.js、自动部署 |

### 部署检查清单

- [ ] 后端 Render 服务已创建
- [ ] 环境变量 `ALLOW_ORIGIN` 已设置为前端域名
- [ ] 前端 Vercel 服务已创建
- [ ] 环境变量 `VITE_API_BASE` 已设置为后端域名
- [ ] 测试 API 接口：`https://your-render-domain.onrender.com/api/health`
- [ ] 测试前端页面：`https://your-vercel-domain.vercel.app`

## 开发计划

- [x] 接入微博真实数据
- [x] 接入知乎真实数据
- [x] 接入B站数据（降级到Mock）
- [x] 实现缓存机制
- [ ] 添加更多平台（抖音、小红书等）
- [ ] 添加搜索功能
- [ ] 添加历史记录
- [ ] 添加 PWA 支持

## License

MIT

---

**Made with ❤️ for learning purposes**