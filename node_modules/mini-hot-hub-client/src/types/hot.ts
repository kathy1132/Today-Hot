export interface HotItem {
  rank: number;
  title: string;
  heat?: string;
  url: string;
}

export interface HotPlatform {
  source: string;
  sourceName: string;
  listName: string;
  updatedAt: string;
  items: HotItem[];
  error?: boolean;
  message?: string;
}

export interface ApiResponse {
  code: number;
  msg: string;
  data: HotPlatform[];
  updateTime: string;
}