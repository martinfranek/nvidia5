declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    MAX_REQUESTS_PER_CRAWL: string;
  }
}
