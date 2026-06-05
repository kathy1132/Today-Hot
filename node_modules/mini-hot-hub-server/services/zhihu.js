/**
 * 知乎热榜数据服务
 *
 * 数据来源：知乎热榜接口
 * 接口地址：https://api.zhihu.com/topstory/hot-list
 *
 * 字段解析说明（方便日后接口变更时修改）：
 * - data.data[].target.title   → 热榜标题 (title)
 * - data.data[].detail_text     → 热度值 (heat)，格式如 "74 千热度"
 * - data.data[].card_id         → 卡片ID，用于构建URL
 *
 * 注意：知乎接口可能返回空数据或格式变化，需定期检查
 */

const ZHIHU_API_URL = 'https://api.zhihu.com/topstory/hot-list';
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function fetchZhihuHot() {
  try {
    const response = await fetch(ZHIHU_API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.zhihu.com/',
        'Origin': 'https://www.zhihu.com'
      }
    });

    if (!response.ok) {
      throw new Error(`知乎接口响应失败: HTTP ${response.status}`);
    }

    const result = await response.json();

    // 接口返回格式：{ data: [...], paging: {...}, ... }
    if (!result || !result.data || !Array.isArray(result.data)) {
      throw new Error('知乎热榜数据为空，可能接口已变更');
    }

    // 解析字段：
    // item.type             → 类型，过滤 hot_list_feed
    // item.target.title     → 热榜标题 (title)
    // item.detail_text      → 热度值 (heat)，格式如 "74 千热度"
    // item.card_id          → 卡片ID，用于构建URL
    const items = result.data
      .filter(item => item.type === 'hot_list_feed' && item.target && item.target.title) // 过滤无效项
      .slice(0, 10) // 最多取10条
      .map((item, index) => ({
        rank: index + 1,
        title: item.target.title,
        heat: item.detail_text || '',
        url: item.card_id ? `https://www.zhihu.com/question/${item.card_id.replace('Q_', '')}` : '#'
      }));

    if (items.length === 0) {
      throw new Error('知乎热榜解析失败，未获取到有效数据');
    }

    return {
      source: 'zhihu',
      sourceName: '知乎',
      listName: '热榜',
      updatedAt: new Date().toISOString(),
      items
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`知乎接口返回格式错误: ${error.message}`);
    }
    if (error.message.includes('知乎')) {
      throw error;
    }
    throw new Error(`获取知乎热榜失败: ${error.message}`);
  }
}

module.exports = { fetchZhihuHot };