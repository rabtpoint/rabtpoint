import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
const port=process.env.PORT||5000;
await connectDb();
createApp().listen(port,()=>console.log(`API running on http://localhost:${port}`));
