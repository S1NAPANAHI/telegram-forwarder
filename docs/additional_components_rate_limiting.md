# Additional Critical Components: Rate Limiting & Performance

## Rate Limiting & Performance
- [x] Setup rate limiting middleware (`middleware/rateLimiter.js`)
  - [x] Import `express-rate-limit`, `RedisStore`, `redis`
  - [x] Create Redis client
  - [x] Implement `createRateLimiter` function
    - [x] Configure Redis store
    - [x] Set `windowMs`, `max`, `message`
    - [x] Enable standard and disable legacy headers
- [x] Define different rate limiters
  - [x] `authLimiter` (for login attempts)
  - [x] `apiLimiter` (general API requests)
  - [x] `keywordLimiter` (for keyword additions)