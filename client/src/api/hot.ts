import { ApiResponse } from '../types/hot';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchHotPlatform(source: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/hot/${source}`);
  return response.json();
}

export async function fetchAllHot(): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/hot`);
  return response.json();
}