import { EdgeRequest } from "../request";

export function withCORS({
    allowedOrigins = ['*'],
    allowedMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowCredentials = true,
    allowedHeaders = ['Content-Type'],
    allowedExposeHeaders = ['WWW-Authenticate', 'Server-Authorization'],
    maxAge = 600,
    optionsSuccessStatus = 204,
    terminatePreflight = false,
  }) {
    return async (request: EdgeRequest) => {
      const { method, headers } = request;
      const origin = headers.get('origin') ?? '';
      const requestHeaders = 'access-control-request-headers';
    
  
      configureOrigin(headers, origin, allowedOrigins);
      configureCredentials(headers, allowCredentials);
      configureExposedHeaders(headers, allowedExposeHeaders);
      // handle preflight requests
      if (method === 'OPTIONS') {
        configureMethods(headers, allowedMethods);
        configureAllowedHeaders(headers, requestHeaders, allowedHeaders);
        configureMaxAge(headers, maxAge);
        if (terminatePreflight) {
          headers.set('status', optionsSuccessStatus.toString());
          headers.set('Content-Length', '0');
          return;
        }
      }
    };
  };
  
  function configureOrigin(headers: Headers, origin: string, allowedOrigins: string[]) {
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins[0] === '*') {
        headers.set('Access-Control-Allow-Origin', '*');
      } else if (allowedOrigins.indexOf(origin) !== -1) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Vary', 'Origin');
      }
    }
  }
  
  function configureCredentials(headers: Headers, allowCredentials: boolean) {
    if (allowCredentials) {
      headers.set('Access-Control-Allow-Credentials', allowCredentials.toString());
    }
  }
  
  function configureMethods(headers: Headers, allowedMethods: string[]) {
    headers.set('Access-Control-Allow-Methods', allowedMethods.join(','));
  }
  
  function configureAllowedHeaders(headers: Headers, requestHeaders: string, allowedHeaders: string[]) {
    if (allowedHeaders.length === 0 && requestHeaders) {
      headers.set('Access-Control-Allow-Headers', requestHeaders); // allowedHeaders wasn't specified, so reflect the request headers
    } else if (allowedHeaders.length) {
      headers.set('Access-Control-Allow-Headers', allowedHeaders.join(','));
    }
  }
  
  function configureMaxAge(headers: Headers, maxAge: number) {
    if (maxAge) {
      headers.set('Access-Control-Max-Age', maxAge.toString());
    }
  }
  
  function configureExposedHeaders(headers: Headers, allowedExposeHeaders: string[]) {
    if (allowedExposeHeaders.length) {
      headers.set('Access-Control-Expose-Headers', allowedExposeHeaders.join(','));
    }
  }