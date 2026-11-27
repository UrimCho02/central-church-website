import type { IncomingHttpHeaders } from 'node:http';

// Minimal structural types for Vercel's Node handlers; no build SDK needed at runtime.
export interface ApiRequest {
  method?: string;
  headers: IncomingHttpHeaders;
  query: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}

export interface ApiResponse {
  setHeader(name: string, value: string | string[] | number): unknown;
  status(code: number): ApiResponse;
  json(body: unknown): unknown;
}
