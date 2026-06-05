# 迷你今日热榜 - 部署前检查表

---

## 📋 部署前检查表

### 1. 基础环境检查

| 检查项 | 要求 | 当前状态 |
|--------|------|----------|
| Node.js 版本 | ≥ 18.x | ⬜ |
| npm 版本 | ≥ 9.x | ⬜ |
| 操作系统 | Linux/macOS/Windows | ⬜ |
| 网络连通性 | 能访问外网（微博/知乎/B站API） | ⬜ |

---

### 2. 端口配置检查

| 服务 | 默认端口 | 配置文件 | 确认 |
|------|----------|----------|------|
| 后端服务 (Express) | `3001` | `server/server.js` | ⬜ |
| 前端服务 (Vite Dev) | `5173` | `client/vite.config.ts` | ⬜ |
| 前端构建后 | 由部署服务器指定 | - | ⬜ |

**端口占用检查：**
```bash
# 检查端口是否被占用
netstat -tlnp | grep 3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows
```

---

### 3. 环境变量配置

#### 前端环境变量 (`client/.env`)

| 变量名 | 默认值 | 说明 | 确认 |
|--------|--------|------|------|
| `VITE_API_BASE` | `''` (空字符串) | 后端API基础路径，生产环境需设置 | ⬜ |

**配置示例：**
```bash
# 开发环境（使用Vite代理）
VITE_API_BASE=

# 生产环境（后端独立部署）
VITE_API_BASE=http://your-server-ip:3001
```

#### 后端环境变量 (`server/.env` - 可选)

| 变量名 | 默认值 | 说明 | 确认 |
|--------|--------|------|------|
| `PORT` | `3001` | 后端服务端口 | ⬜ |
| `CORS_ORIGIN` | `http://localhost:5173` | 允许的前端域名 | ⬜ |

---

### 4. API 地址配置

#### 前端 API 配置 (`client/vite.config.ts`)

```typescript
// 开发环境代理配置
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

**生产环境处理方式：**
1. 使用 `VITE_API_BASE` 环境变量指定后端地址
2. 在 `client/src/api/hot.ts` 中使用动态基础路径

#### 后端数据来源

| 平台 | API地址 | 状态 |
|------|---------|------|
| 微博 | `https://weibo.com/ajax/side/hotSearch` | ✅ 需完整请求头 |
| 知乎 | `https://api.zhihu.com/topstory/hot-list` | ✅ |
| B站 | `https://api.bilibili.com/x/web-interface/ranking/v2` | ✅ |

---

### 5. 依赖安装检查

```bash
# 后端依赖
cd server && npm install
npm ls  # 确认无缺失依赖

# 前端依赖
cd client && npm install
npm ls  # 确认无缺失依赖
```

| 依赖 | 版本要求 | 确认 |
|------|----------|------|
| express | ^4.19.x | ⬜ |
| cors | ^2.8.x | ⬜ |
| axios | ^1.16.x | ⬜ |
| react | ^18.3.x | ⬜ |
| vite | ^6.x | ⬜ |

---

### 6. 构建验证

**前端构建：**
```bash
cd client && npm run build
```

| 检查项 | 要求 | 确认 |
|--------|------|------|
| TypeScript 编译 | 无错误 | ⬜ |
| Vite 构建 | 无错误 | ⬜ |
| 产物生成 | `dist/` 目录存在 | ⬜ |

**构建产物清单：**
- `dist/index.html`
- `dist/assets/index-*.css`
- `dist/assets/index-*.js`

---

### 7. 服务启动验证

**开发环境：**
```bash
# 终端1: 启动后端
cd server && npm run dev

# 终端2: 启动前端
cd client && npm run dev
```

**验证步骤：**
| 检查项 | 预期结果 | 确认 |
|--------|----------|------|
| 后端启动 | `Server running on http://localhost:3001` | ⬜ |
| 前端启动 | `Local: http://localhost:5173/` | ⬜ |
| 健康检查 | `curl http://localhost:3001/api/health` 返回 `{ok:true}` | ⬜ |
| 热榜数据 | `curl http://localhost:3001/api/hot` 返回三平台数据 | ⬜ |
| 页面访问 | 浏览器访问 http://localhost:5173 显示热榜 | ⬜ |

---

### 8. 生产环境部署配置

#### 反向代理配置 (Nginx 示例)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 进程管理 (PM2 示例)

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd server
pm2 start server.js --name hot-hub-server

# 查看状态
pm2 status
pm2 logs hot-hub-server
```

---

### 9. 安全检查

| 检查项 | 说明 | 确认 |
|--------|------|------|
| CORS 配置 | 生产环境限制允许的域名 | ⬜ |
| HTTPS | 生产环境启用 HTTPS | ⬜ |
| 请求频率限制 | 考虑添加限流中间件 | ⬜ |
| 敏感信息 | 无硬编码密钥/凭证 | ⬜ |

---

### 10. 监控与日志

| 检查项 | 说明 | 确认 |
|--------|------|------|
| 日志记录 | 后端请求日志正常输出 | ⬜ |
| 错误监控 | 配置错误捕获和告警 | ⬜ |
| 性能监控 | 可选：添加 APM 工具 | ⬜ |

---

## ✅ 部署确认

```
┌─────────────────────────────────────────────────────────┐
│              部署前检查完成确认                          │
├─────────────────────────────────────────────────────────┤
│  [ ] 环境依赖已安装                                     │
│  [ ] 端口配置正确且未被占用                             │
│  [ ] 环境变量已配置（生产环境）                         │
│  [ ] 前端构建成功                                       │
│  [ ] 后端服务启动正常                                   │
│  [ ] API接口测试通过                                   │
│  [ ] 页面访问正常                                       │
│  [ ] 安全配置已完成                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 部署命令速查

```bash
# 1. 克隆项目
git clone <repository-url>
cd Today-Hot

# 2. 安装依赖
cd server && npm install
cd ../client && npm install

# 3. 配置环境变量（生产环境）
# 在 client/.env 中设置 VITE_API_BASE

# 4. 构建前端
cd client && npm run build

# 5. 启动后端（开发模式）
cd server && npm run dev

# 5. 启动后端（生产模式 - PM2）
cd server && pm2 start server.js --name hot-hub-server
```

---

**版本**: v1.0  
**日期**: 2026-06-02  
**项目**: 迷你今日热榜