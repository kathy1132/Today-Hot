/**
 * B站热搜数据服务
 *
 * 数据来源：B站排行榜接口
 * 接口地址：https://api.bilibili.com/x/web-interface/ranking/v2
 *
 * 字段解析说明（方便日后接口变更时修改）：
 * - data[].title           → 热搜标题 (title)
 * - data[].short_link_v2   → 详情链接 (url)
 * - data[].score            → 热度值 (heat)
 *
 * 注意：B站接口可能返回空数据或格式变化，需定期检查
 */

const BILIBILI_API_URL = 'https://api.bilibili.com/x/web-interface/ranking/v2';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchBilibiliHot() {
  try {
    const response = await fetch(BILIBILI_API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        'Cookie': 'SESSDATA=; bili_jct=;' // 模拟未登录状态
      }
    });

    if (!response.ok) {
      throw new Error(`B站接口响应失败: HTTP ${response.status}`);
    }

    const result = await response.json();

    // 接口返回格式：{ code: 0, message: "0", data: { list: [...] } }
    if (result.code !== 0) {
      throw new Error(`B站接口返回错误: code=${result.code}, message=${result.message || '未知错误'}`);
    }

    if (!result.data || !Array.isArray(result.data.list)) {
      throw new Error('B站接口数据格式变化，请检查字段解析逻辑');
    }

    // 解析字段：
    // item.title         → 热搜标题 (title)
    // item.short_link_v2 → 详情链接 (url)
    // item.stat.view     → 播放量，作为热度值 (heat)
    const items = result.data.list
      .filter(item => item.title && item.stat) // 过滤无效项
      .slice(0, 10) // 最多取10条
      .map((item, index) => {
        // 使用播放量作为热度值，格式化显示
        const viewCount = item.stat.view || 0;
        let heat = '';
        if (viewCount >= 10000) {
          heat = (viewCount / 10000).toFixed(1) + '万';
        } else if (viewCount > 0) {
          heat = String(viewCount);
        }
        
        // 优先使用短链接，否则使用bvid构建链接
        let url = '#';
        if (item.short_link_v2) {
          url = item.short_link_v2;
        } else if (item.bvid) {
          url = `https://www.bilibili.com/video/${item.bvid}`;
        }
        
        return {
          rank: index + 1,
          title: item.title,
          heat,
          url
        };
      });

    if (items.length === 0) {
      throw new Error('B站热搜解析失败，未获取到有效数据');
    }

    return {
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜',
      updatedAt: new Date().toISOString(),
      items
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`B站接口返回格式错误: ${error.message}`);
    }
    if (error.message.includes('B站')) {
      throw error;
    }
    throw new Error(`获取B站热搜失败: ${error.message}`);
  }
}

module.exports = { fetchBilibiliHot };