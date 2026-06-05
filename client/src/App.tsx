import { Layout } from './components/Layout';
import { HotCard } from './components/HotCard';
import { useHotList } from './hooks/useHotList';
import './App.css';

function App() {
  const { data, loading, error, refetch } = useHotList();

  const handleRefresh = () => {
    refetch();
  };

  const renderCards = () => {
    const sources = ['weibo', 'zhihu', 'bilibili'];
    
    if (loading || error) {
      return sources.map((source) => (
        <HotCard
          key={source}
          platform={{
            source,
            sourceName: source === 'weibo' ? '微博' : source === 'zhihu' ? '知乎' : 'B站',
            listName: source === 'weibo' ? '实时热搜' : source === 'zhihu' ? '热榜' : '热搜',
            updatedAt: '',
            items: [],
          }}
          loading={loading}
          error={error}
          onRetry={refetch}
        />
      ));
    }

    return data.map((platform) => (
      <HotCard
        key={platform.source}
        platform={platform}
        loading={false}
        error={null}
        onRetry={refetch}
      />
    ));
  };

  return (
    <Layout onRefresh={handleRefresh} isRefreshing={loading}>
      <div className="card-grid">
        {renderCards()}
      </div>
    </Layout>
  );
}

export default App;