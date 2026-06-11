import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/messages.routes.js';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/users.routes.js';
export const createApp=()=>{ const app=express(); const allowed=[process.env.LOCAL_URL,process.env.WEBSITE_URL].filter(Boolean); app.use(cors({origin(o,cb){ if(!o||allowed.includes(o)) return cb(null,true); cb(new Error('Not allowed by CORS'));},credentials:true})); app.use(express.json({limit:'1mb'})); app.use(morgan('dev')); app.get('/api/health',(req,res)=>res.json({status:'ok',localUrl:process.env.LOCAL_URL,websiteUrl:process.env.WEBSITE_URL})); app.use('/api/auth',authRoutes); app.use('/api/users',userRoutes); app.use('/api/posts',postRoutes); app.use('/api/messages',messageRoutes); app.use((err,req,res,next)=>res.status(500).json({message:err.message||'Server error'})); return app; };
