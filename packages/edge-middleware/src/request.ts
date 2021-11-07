import { NextRequest } from 'next/server'
import type { IResult } from 'ua-parser-js';

export class EdgeRequest extends NextRequest {
  constructor(input: EdgeRequest | string, init?: RequestInit) {
       super(input, init)
  }
  content?: Object
  user?: User
  cf?: IncomingRequestCfProperties;
}

export interface EdgeRequestInit extends RequestInit {
  geo?: {
      city?: string;
      country?: string;
      region?: string;
  };
  ip?: string;
  nextConfig?: {
      basePath?: string;
      i18n?: I18NConfig | null;
      trailingSlash?: boolean;
  };
  page?: {
      name?: string;
      params?: {
          [key: string]: string;
      };
  };
}
interface UserAgent extends IResult {
  isBot: boolean;
}

export interface I18NConfig {
  defaultLocale: string;
  domains?: DomainLocale[];
  localeDetection?: false;
  locales: string[];
}
export interface DomainLocale {
  defaultLocale: string;
  domain: string;
  http?: true;
  locales?: string[];
}

export type User = {
  name?: string
  email?: string
  image?: string
  userId?: string
  anonymousId?: string
  admin?: true
}

export type EdgeResponseInit = RequestInit