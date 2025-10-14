# Additional Critical Components: Error Handling & Logging

## Error Handling & Logging
- [x] Setup `winston` logger (`utils/logger.js`)
  - [x] Create logger instance
  - [x] Configure log level ('info')
  - [x] Configure format (timestamp, errors with stack, JSON)
  - [x] Set default metadata (service name)
  - [x] Configure transports (file for error.log, file for combined.log, console)
- [x] Implement global error handlers
  - [x] Handle `unhandledRejection`
  - [x] Handle `uncaughtException`