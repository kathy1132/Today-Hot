import { useState, useEffect, useCallback } from 'react';
import { fetchHotList } from '../api/fetchHot';
import { ApiResponse, HotPlatform } from '../types/hot';

interface UseHotListResult {
  data: HotPlatform[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHotList(): UseHotListResult {
  const [data, setData] = useState<HotPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const res: ApiResponse = await fetchHotList();
      if (res.code === 200) {
        setData(res.data);
      } else {
        setError(res.msg);
      }
    } catch (e) {
      setError('数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}