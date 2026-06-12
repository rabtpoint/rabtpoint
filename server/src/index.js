import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';

const port = process.env.PORT || 5000;

await connectDb();

createApp().listen(port, '0.0.0.0', () => {
  console.log(`API running on http://localhost:${port}`);
});
