/**
 * 迷你今日热榜 - 前端Hook测试用例
 * 
 * 测试框架: Jest + React Testing Library
 * 测试范围: useHotList Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useHotList } from '../hooks/useHotList';
import { fetchHotList } from '../api/fetchHot';

// Mock API调用
jest.mock('../api/fetchHot');

describe('useHotList Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSuccessData = {
    code: 200,
    msg: '请求成功',
    data: [
      {
        source: 'weibo',
        sourceName: '微博',
        listName: '实时热搜',
        updatedAt: '2024-01-01T00:00:00Z',
        items: [
          { rank: 1, title: '测试热搜1', heat: '100000', url: '#' },
          { rank: 2, title: '测试热搜2', heat: '90000', url: '#' },
        ]
      }
    ],
    updateTime: '2024-01-01T00:00:00Z'
  };

  it('应该初始化为loading状态', () => {
    (fetchHotList as jest.Mock).mockResolvedValueOnce(mockSuccessData);
    
    const { result } = renderHook(() => useHotList());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual([]);
  });

  it('应该成功获取热榜数据', async () => {
    (fetchHotList as jest.Mock).mockResolvedValue(mockSuccessData);
    
    const { result } = renderHook(() => useHotList());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(mockSuccessData.data);
    // React 18 严格模式会导致双重渲染，所以只需验证已被调用
    expect(fetchHotList).toHaveBeenCalled();
  });

  it('应该处理API错误', async () => {
    (fetchHotList as jest.Mock).mockResolvedValueOnce({
      code: 500,
      msg: '服务器错误',
      data: [],
      updateTime: '2024-01-01T00:00:00Z'
    });
    
    const { result } = renderHook(() => useHotList());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('服务器错误');
    expect(result.current.data).toEqual([]);
  });

  it('应该处理网络错误', async () => {
    (fetchHotList as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useHotList());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('数据加载失败');
  });

  it('应该支持refetch功能', async () => {
    (fetchHotList as jest.Mock)
      .mockResolvedValueOnce(mockSuccessData)
      .mockResolvedValueOnce({
        ...mockSuccessData,
        data: [
          {
            ...mockSuccessData.data[0],
            items: [{ rank: 1, title: '新热搜', heat: '200000', url: '#' }]
          }
        ]
      });
    
    const { result } = renderHook(() => useHotList());
    
    // 等待初始加载完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const initialData = result.current.data;
    
    // 调用refetch
    act(() => {
      result.current.refetch();
    });
    
    // 验证正在加载
    expect(result.current.loading).toBe(true);
    
    // 等待重新加载完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // 验证数据已更新
    expect(result.current.data[0].items[0].title).toBe('新热搜');
    expect(fetchHotList).toHaveBeenCalledTimes(2);
  });
});