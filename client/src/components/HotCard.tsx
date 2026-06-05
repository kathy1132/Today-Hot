import { HotPlatform, HotItem } from '../types/hot';

interface HotCardProps {
  platform: HotPlatform;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function formatUpdateTime(updatedAt: string): string {
  const now = new Date();
  const updateTime = new Date(updatedAt);
  
  // 处理无效日期
  if (isNaN(updateTime.getTime())) {
    return '未知';
  }
  
  const diffMs = now.getTime() - updateTime.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 10) {
    return '刚刚';
  } else if (diffSeconds < 60) {
    return `${diffSeconds}秒前`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    // 超过一周显示日期
    return updateTime.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

function SkeletonItem() {
  return (
    <li className="hot-item hot-item-skeleton">
      <span className="hot-rank skeleton"></span>
      <div className="hot-title skeleton"></div>
      <span className="hot-heat skeleton"></span>
    </li>
  );
}

export function HotCard({ platform, loading, error, onRetry }: HotCardProps) {
  return (
    <div className="hot-card">
      <div className="hot-card-header">
        <h2>{platform.sourceName}</h2>
        <span className="list-name">{platform.listName}</span>
      </div>

      {loading && (
        <div className="hot-card-content">
          <ul className="hot-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </ul>
          <div className="hot-card-footer skeleton">
            <span className="skeleton-text"></span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="hot-card-content hot-card-error">
          <div className="hot-card-error-msg">
            <div className="error-icon">!</div>
            <p>{error || '数据加载失败'}</p>
          </div>
          {onRetry && (
            <button className="retry-btn" onClick={onRetry}>
              点击重试
            </button>
          )}
        </div>
      )}

      {!loading && !error && platform.error && (
        <div className="hot-card-content hot-card-error">
          <div className="hot-card-error-msg">
            <div className="error-icon">!</div>
            <p>{platform.message || '数据获取失败'}</p>
          </div>
          {onRetry && (
            <button className="retry-btn" onClick={onRetry}>
              点击重试
            </button>
          )}
        </div>
      )}

      {!loading && !error && !platform.error && platform.items.length === 0 && (
        <div className="hot-card-content hot-card-empty">
          <div className="empty-icon">📭</div>
          <p>暂无数据</p>
        </div>
      )}

      {!loading && !error && !platform.error && platform.items.length > 0 && (
        <div className="hot-card-content">
          <ul className="hot-list">
            {platform.items.map((item: HotItem) => {
              let rankClass = '';
              if (item.rank === 1) rankClass = 'hot-item-rank1';
              else if (item.rank === 2) rankClass = 'hot-item-rank2';
              else if (item.rank === 3) rankClass = 'hot-item-rank3';

              return (
                <li
                  key={item.rank}
                  className={`hot-item ${rankClass}`}
                >
                  <span className={`hot-rank ${rankClass}`}>{item.rank}</span>
                  <a href={item.url} className="hot-title" target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                  {item.heat && <span className="hot-heat">{item.heat}</span>}
                </li>
              );
            })}
          </ul>
          <div className="hot-card-footer">
            更新于 {formatUpdateTime(platform.updatedAt)}
          </div>
        </div>
      )}
    </div>
  );
}