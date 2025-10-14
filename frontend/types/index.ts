// Type definitions for the Telegram Forwarder Bot Admin Interface

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export interface Keyword {
  _id: string;
  keyword: string;
  isActive: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
  createdAt: string;
  matchesToday?: number;
  totalMatches?: number;
}

export interface Channel {
  _id: string;
  channelName: string;
  channelUrl: string;
  platform: 'telegram' | 'eitaa';
  isActive: boolean;
  messagesToday?: number;
  totalMessages?: number;
  createdAt: string;
}

export interface Destination {
  _id: string;
  name: string;
  type: 'telegram_channel' | 'telegram_group' | 'telegram_user';
  destination: string;
  isActive: boolean;
  messagesForwarded?: number;
  createdAt: string;
}

export interface Log {
  _id: string;
  message: string;
  timestamp: string;
  keywordId: {
    _id: string;
    keyword: string;
  };
  channelId: {
    _id: string;
    channelName: string;
  };
  destinationId?: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'forwarded' | 'failed';
  error?: string;
}

export interface Analytics {
  totalMessages: number;
  totalForwards: number;
  successRate: number;
  activeKeywords: number;
  activeChannels: number;
  dailyStats: Array<{
    date: string;
    messages: number;
    forwards: number;
    success_rate: number;
  }>;
  keywordPerformance: Array<{
    keyword: string;
    matches: number;
    success_rate: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

// Form data interfaces
export interface KeywordFormData {
  keyword: string;
  caseSensitive: boolean;
  exactMatch: boolean;
  isActive: boolean;
}

export interface ChannelFormData {
  channelName: string;
  channelUrl: string;
  platform: 'telegram' | 'eitaa';
  isActive: boolean;
}

export interface DestinationFormData {
  name: string;
  type: 'telegram_channel' | 'telegram_group' | 'telegram_user';
  destination: string;
  isActive: boolean;
}

// Component props interfaces
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  loading?: boolean;
  className?: string;
}

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: (row: any) => React.ReactNode;
  className?: string;
}

// Theme and UI types
export type ThemeMode = 'light' | 'dark';

export interface LayoutProps {
  children: React.ReactNode;
}

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Query keys for react-query
export const QUERY_KEYS = {
  KEYWORDS: ['keywords'] as const,
  CHANNELS: ['channels'] as const,
  DESTINATIONS: ['destinations'] as const,
  LOGS: ['logs'] as const,
  ANALYTICS: ['analytics'] as const,
  USER: ['user'] as const,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  KEYWORDS: '/api/keywords',
  CHANNELS: '/api/channels',
  DESTINATIONS: '/api/destinations',
  LOGS: '/api/logs',
  ANALYTICS: '/api/analytics',
  AUTH: '/api/auth',
} as const;
