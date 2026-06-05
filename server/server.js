const express = require('express');
const cors = require('cors');
const { getHotData, clearCache } = require('./services/hotCrawler');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/hot/:source', async (req, res) => {
  const { source } = req.params;
  const { refresh } = req.query;
  const skipCache = refresh === '1';

  let data;

  if (!skipCache) {
    data = await getHotData(source, true);
    if (data) {
      return res.json({
        code: 200,
        msg: '请求成功（缓存）',
        data: [data]
      });
    }
  }

  data = await getHotData(source, false);

  if (!data) {
    return res.status(404).json({
      code: 404,
      msg: `不支持的平台: ${source}`,
      data: []
    });
  }

  res.json({
    code: 200,
    msg: '请求成功',
    data: [data]
  });
});

app.get('/api/hot', async (req, res) => {
  const platforms = ['weibo', 'zhihu', 'bilibili'];
  const data = await Promise.all(platforms.map(source => getHotData(source, true)));

  res.json({
    code: 200,
    msg: '请求成功',
    platforms: data,
    updateTime: new Date().toISOString()
  });
});

app.post('/api/hot/refresh', (req, res) => {
  clearCache();
  res.json({
    code: 200,
    msg: '缓存已清空，下次请求将获取最新数据',
    data: []
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`启动:${PORT}`);
});