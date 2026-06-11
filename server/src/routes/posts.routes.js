import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Post } from '../models/Post.js';
const router=express.Router();
router.get('/',requireAuth,async(req,res)=>{ const posts=await Post.find().populate('author','name photo location bio').sort({createdAt:-1}).limit(100); res.json({posts}); });
router.post('/',requireAuth,async(req,res)=>{ const {text,image,place}=req.body; if(!text) return res.status(400).json({message:'Post text is required'}); const post=await Post.create({author:req.user._id,text,image,place}); res.status(201).json({post:await post.populate('author','name photo location bio')}); });
export default router;
