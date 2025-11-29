import "@testing-library/jest-dom";

// Polyfill for Request/Response APIs needed by Next.js server code
// Use minimal polyfills for jsdom environment
if (typeof globalThis.Request === "undefined") {
  // Simple polyfill - Next.js will handle the actual implementation
  globalThis.Request = class Request {
    constructor(public input: string | Request, public init?: RequestInit) {}
  } as any;
  
  globalThis.Response = class Response {
    constructor(public body?: BodyInit | null, public init?: ResponseInit) {}
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), init);
    }
  } as any;
  
  globalThis.Headers = class Headers {
    constructor(init?: HeadersInit) {}
    get(name: string) { return null; }
    set(name: string, value: string) {}
  } as any;
}

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  headers: jest.fn(() => Promise.resolve(new Headers())),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn((namespace: string) => (key: string) => `${namespace}.${key}`),
  useLocale: jest.fn(() => "en"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() => (key: string) => key),
  getLocale: jest.fn(() => "en"),
}));

