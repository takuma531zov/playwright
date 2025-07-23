export interface ScrapeResult {
  url: string;
  contactUrl: string | null;
  status: 'success' | 'error';
  error?: string;
}

export interface UrlData {
  url: string;
}