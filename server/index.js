require('dotenv').config();
const express = require('express');
const cors = require('cors');
const hotRouter = require('./routes/hot');

const app = express();

// 请求路径日志（需求必填）
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS跨域：生产/开发区分域名
const origin = process.env.NODE_ENV === 'production' ? process.env.ALLOW_ORIGIN : 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));

app.use('/api/hot', hotRouter);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// 端口：Railway自动PORT，本地固定3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server run on port:${PORT}`);
});