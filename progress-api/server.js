const createApp = require('./app');

const PORT = process.env.PORT || 8700;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`Progress API running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await app.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
