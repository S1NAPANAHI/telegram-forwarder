// ... previous server setup (unchanged)

// Routes with logs
const routes = [
  { path: '/api/auth', file: './routes/auth.js' },
  { path: '/api/keywords', file: './routes/keywords' },
  { path: '/api/channels', file: './routes/channels' },
  { path: '/api/destinations', file: './routes/destinations' },
  { path: '/api/discovery', file: './routes/discovery' },
  { path: '/api/client-auth', file: './routes/clientAuth' },
  { path: '/api/monitoring', file: './routes/monitoring' },
  { path: '/api/logs', file: './routes/logs' },
  { path: '/api/analytics', file: './routes/analytics' }
];

routes.forEach(route => {
  try {
    if (route.files) {
      route.files.forEach(file => {
        try {
          app.use(route.path, require(file));
          console.log(`✓ Loaded route: ${route.path} from ${file}`);
        } catch (fileError) {
          console.error(`✗ Failed to load route ${file} for ${route.path}:`, fileError.message);
        }
      });
    } else if (route.file) {
      app.use(route.path, require(route.file));
      console.log(`✓ Loaded route: ${route.path} from ${route.file}`);
    }
  } catch (routeError) {
    console.error(`✗ Failed to load route ${route.path}:`, routeError.message);
  }
});

// ... rest unchanged
