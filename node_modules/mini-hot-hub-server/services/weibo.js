/**
 * 微博热搜数据服务
 *
 * 数据来源：微博热搜接口
 * 接口地址：https://weibo.com/ajax/side/hotSearch
 *
 * 字段解析说明（方便日后接口变更时修改）：
 * - data.realtime[].word         → 热搜标题 (title)
 * - data.realtime[].num         → 热度值 (heat)
 * - data.realtime[].raw_hot_url  → 详情链接 (url)
 *
 * 注意：微博接口可能返回空数据或格式变化，需定期检查
 */

const WEIBO_API_URL = 'https://weibo.com/ajax/side/hotSearch';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchWeiboHot() {
  const headers = {
    "User-Agent": USER_AGENT,
    "Referer": "https://weibo.com/",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Origin": "https://weibo.com"
  };

  try {
    const response = await fetch(WEIBO_API_URL, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`微博接口响应失败: HTTP ${response.status}`);
    }

    const result = await response.json();

    // 接口返回格式：{ ok: 1, msg: "成功", data: { realtime: [...] } }
    if (result.ok !== 1) {
      throw new Error(`微博接口返回错误: ${result.msg || '未知错误'}`);
    }

    if (!result.data || !Array.isArray(result.data.realtime)) {
      throw new Error('微博接口数据格式变化，请检查字段解析逻辑');
    }

    // 解析字段：
    // item.word         → 热搜标题 (title)
    // item.num         → 热度值 (heat)
    // item.raw_hot_url  → 详情链接 (url)
    const items = result.data.realtime
      .filter(item => item.word) // 过滤无效项
      .slice(0, 10) // 最多取10条
      .map((item, index) => ({
        rank: index + 1,
        title: item.word,
        heat: item.num ? String(item.num) : '',
        url: item.raw_hot_url || `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word)}`
      }));

    if (items.length === 0) {
      throw new Error('微博热搜解析失败，未获取到有效数据');
    }

    return {
      source: 'weibo',
      sourceName: '微博',
      listName: '实时热搜',
      updatedAt: new Date().toISOString(),
      items
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`微博接口返回格式错误: ${error.message}`);
    }
    if (error.message.includes('微博')) {
      throw error;
    }
    throw new Error(`获取微博热搜失败: ${error.message}`);
  }
}

module.exports = { fetchWeiboHot };