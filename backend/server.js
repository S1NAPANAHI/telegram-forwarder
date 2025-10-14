const express = require('express');
require('dotenv').config({ path: '../.env' });
const monitoringManager = require('./services/monitoringManager');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/keywords', require('./routes/keywords'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/logs', require('./routes/logs'));

// Initialize monitoring manager
monitoringManager.initialize();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});