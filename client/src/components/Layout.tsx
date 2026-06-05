interface LayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Layout({ children, onRefresh, isRefreshing }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">迷你今日热榜</h1>
            <p className="header-desc">一站式聚合微博、知乎、B站实时热点</p>
          </div>
          {onRefresh && (
            <button
              className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={onRefresh}
              disabled={isRefreshing}
              title="刷新热榜"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
              <span>{isRefreshing ? '刷新中' : '刷新'}</span>
            </button>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <p>本项目为个人练习项目，非商用</p>
        <p>数据来源于各平台公开榜单，仅供学习参考</p>
        <p>© 2026 迷你今日热榜 All Rights Reserved</p>
      </footer>
    </div>
  );
}