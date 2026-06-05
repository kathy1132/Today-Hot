import { ApiResponse } from '../types/hot';

const baseUrl = import.meta.env.VITE_API_BASE;

// 获取全平台榜单
export async function fetchAllHot(): Promise<ApiResponse> {
  const res = await fetch(`${baseUrl}/hot`);
  return res.json();
}

// 单平台榜单
export async function fetchSingleHot(source: string): Promise<ApiResponse> {
  const res = await fetch(`${baseUrl}/hot/${source}`);
  return res.json();
}

// 兼容旧接口的封装
export async function fetchHotList(): Promise<ApiResponse> {
  try {
    const res = await fetchAllHot();
    return {
      ...res,
      data: (res as any).platforms || res.data || []
    };
  } catch (e) {
    console.error('Failed to fetch hot list:', e);
    return {
      code: 500,
      msg: '数据加载失败',
      data: [],
      updateTime: new Date().toISOString()
    };
  }
}