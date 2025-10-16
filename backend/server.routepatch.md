// Wire new routes: authLinkTelegram, settings, adminMigrate, and autopromote scan
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ override: true });

// existing imports ...

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// existing route mounts ...
try { app.use('/api/auth', require('./routes/authLinkTelegram')); } catch {}
try { app.use('/api/settings', require('./routes/settings')); } catch {}
try { app.use('/api/admin', require('./routes/adminMigrate')); } catch {}
try { app.use('/api/discovery', require('./routes/discovery.autopromote.patch')); } catch {}

// existing server start ...

module.exports = app;