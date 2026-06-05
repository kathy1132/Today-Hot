const express = require('express');
const router = express.Router();
const { getHotData, clearCache } = require('../services/hotCrawler');

router.get('/:source', async (req, res) => {
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

router.get('/', async (req, res) => {
  const platforms = ['weibo', 'zhihu', 'bilibili'];
  const data = await Promise.all(platforms.map(source => getHotData(source, true)));

  res.json({
    code: 200,
    msg: '请求成功',
    platforms: data,
    updateTime: new Date().toISOString()
  });
});

router.post('/refresh', (req, res) => {
  clearCache();
  res.json({
    code: 200,
    msg: '缓存已清空，下次请求将获取最新数据',
    data: []
  });
});

module.exports = router;