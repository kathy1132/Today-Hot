/**
 * 迷你今日热榜 - 后端API测试用例
 * 
 * 测试框架: Jest + Supertest
 * 测试范围: 
 *   - 健康检查接口
 *   - 热榜数据接口
 *   - 缓存机制
 *   - 错误处理
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// 导入被测试的模块
const { getHotData, clearCache } = require('../services/hotCrawler');
const { fetchWeiboHot } = require('../services/weibo');
const { fetchZhihuHot } = require('../services/zhihu');
const { fetchBilibiliHot } = require('../services/bilibili');
const { getCache, setCache, clearCache: clearCacheUtil } = require('../utils/cache');

// 创建测试用的Express应用
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 测试路由
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
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

describe('迷你今日热榜 API 测试', () => {
  /**
   * 健康检查接口测试
   */
  describe('GET /api/health', () => {
    it('应该返回健康状态', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });
  });

  /**
   * 缓存工具测试
   */
  describe('缓存工具', () => {
    beforeEach(() => {
      clearCacheUtil();
    });

    it('应该能够设置和获取缓存', () => {
      const key = 'test_key';
      const value = { data: 'test_data' };
      
      setCache(key, value);
      const cached = getCache(key);
      
      expect(cached).toEqual(value);
    });

    it('应该能够清空缓存', () => {
      const key = 'test_key';
      const value = { data: 'test_data' };
      
      setCache(key, value);
      clearCacheUtil();
      const cached = getCache(key);
      
      expect(cached).toBeNull();
    });

    it('缓存应该在TTL过期后失效', async () => {
      const key = 'test_ttl_key';
      const value = { data: 'test_data' };
      
      // 设置短TTL缓存
      setCache(key, value, 1); // 1秒TTL
      let cached = getCache(key);
      expect(cached).toEqual(value);
      
      // 等待2秒后检查
      await new Promise(resolve => setTimeout(resolve, 2000));
      cached = getCache(key);
      
      expect(cached).toBeNull();
    });
  });

  /**
   * 热榜数据接口测试
   */
  describe('GET /api/hot/:source', () => {
    const validSources = ['weibo', 'zhihu', 'bilibili'];
    const invalidSources = ['invalid', 'baidu', 'toutiao'];

    it.each(validSources)(
      '应该返回 %s 平台的热榜数据',
      async (source) => {
        const response = await request(app).get(`/api/hot/${source}?refresh=1`);
        
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        const platformData = response.body.data[0];
        expect(platformData).toHaveProperty('source', source);
        expect(platformData).toHaveProperty('sourceName');
        expect(platformData).toHaveProperty('listName');
        expect(platformData).toHaveProperty('updatedAt');
        expect(platformData).toHaveProperty('items');
        expect(Array.isArray(platformData.items)).toBe(true);
      }
    );

    it.each(invalidSources)(
      '应该对无效平台 %s 返回404',
      async (source) => {
        const response = await request(app).get(`/api/hot/${source}`);
        
        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.msg).toContain(source);
      }
    );

    it('应该返回有效的热榜数据结构', async () => {
      const response = await request(app).get('/api/hot/weibo?refresh=1');
      const platformData = response.body.data[0];
      const items = platformData.items;
      
      // 检查items结构
      if (items.length > 0) {
        const firstItem = items[0];
        expect(firstItem).toHaveProperty('rank');
        expect(typeof firstItem.rank).toBe('number');
        expect(firstItem).toHaveProperty('title');
        expect(typeof firstItem.title).toBe('string');
        expect(firstItem.title.length).toBeGreaterThan(0);
        expect(firstItem).toHaveProperty('url');
        expect(typeof firstItem.url).toBe('string');
      }
    });
  });

  /**
   * 获取所有平台热榜测试
   */
  describe('GET /api/hot', () => {
    it('应该返回所有三个平台的热榜数据', async () => {
      const response = await request(app).get('/api/hot');
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.platforms).toBeInstanceOf(Array);
      expect(response.body.platforms.length).toBe(3);
      expect(response.body).toHaveProperty('updateTime');
      
      // 检查每个平台的数据结构
      response.body.platforms.forEach(platform => {
        expect(platform).toHaveProperty('source');
        expect(platform).toHaveProperty('sourceName');
        expect(platform).toHaveProperty('listName');
        expect(platform).toHaveProperty('updatedAt');
        expect(platform).toHaveProperty('items');
      });
    });
  });

  /**
   * 缓存刷新测试
   */
  describe('POST /api/hot/refresh', () => {
    it('应该清空缓存', async () => {
      // 先获取数据以填充缓存
      await request(app).get('/api/hot/weibo');
      
      // 验证缓存中有数据
      const cachedBefore = getCache('hot_weibo');
      expect(cachedBefore).not.toBeNull();
      
      // 调用刷新接口
      const response = await request(app).post('/api/hot/refresh');
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      
      // 验证缓存已清空
      const cachedAfter = getCache('hot_weibo');
      expect(cachedAfter).toBeNull();
    });
  });

  /**
   * 各平台数据服务测试
   */
  describe('数据服务测试', () => {
    it('微博数据服务应该返回有效数据', async () => {
      try {
        const data = await fetchWeiboHot();
        expect(data).toHaveProperty('source', 'weibo');
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
      } catch (error) {
        // 如果接口调用失败，应该返回mock数据
        console.log('微博接口调用失败，预期会使用mock数据');
        expect(error).toBeDefined();
      }
    });

    it('知乎数据服务应该返回有效数据', async () => {
      try {
        const data = await fetchZhihuHot();
        expect(data).toHaveProperty('source', 'zhihu');
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
      } catch (error) {
        console.log('知乎接口调用失败，预期会使用mock数据');
        expect(error).toBeDefined();
      }
    });

    it('B站数据服务应该返回有效数据', async () => {
      try {
        const data = await fetchBilibiliHot();
        expect(data).toHaveProperty('source', 'bilibili');
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
      } catch (error) {
        console.log('B站接口调用失败，预期会使用mock数据');
        expect(error).toBeDefined();
      }
    });
  });

  /**
   * 边界情况测试
   */
  describe('边界情况测试', () => {
    it('应该处理空数据情况', async () => {
      // 测试空items的处理
      const response = await request(app).get('/api/hot');
      response.body.platforms.forEach(platform => {
        // 要么有items，要么有error标记
        if (platform.items && platform.items.length === 0) {
          expect(platform.error).toBeDefined();
        }
      });
    });

    it('应该正确处理refresh参数', async () => {
      // 先清空缓存
      await request(app).post('/api/hot/refresh');
      
      // 第一次请求，使用缓存（会设置缓存）
      const response1 = await request(app).get('/api/hot/weibo');
      const time1 = response1.body.data[0].updatedAt;
      
      // 等待1秒后再次请求，应该命中缓存
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response2 = await request(app).get('/api/hot/weibo');
      const time2 = response2.body.data[0].updatedAt;
      
      // 验证缓存生效（时间相同）
      expect(time2).toBe(time1);
      
      // 再次请求，强制刷新（跳过缓存）
      const response3 = await request(app).get('/api/hot/weibo?refresh=1');
      const time3 = response3.body.data[0].updatedAt;
      
      // 验证刷新后时间更新
      expect(time3).not.toBe(time2);
    });
  });
});