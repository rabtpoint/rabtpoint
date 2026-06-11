import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Message } from '../models/Message.js';
const router=express.Router();
router.get('/:receiverId',requireAuth,async(req,res)=>{ const r=req.params.receiverId; const messages=await Message.find({$or:[{sender:req.user._id,receiver:r},{sender:r,receiver:req.user._id}]}).populate('sender','name photo').populate('receiver','name photo').sort({createdAt:1}); res.json({messages}); });
router.post('/:receiverId',requireAuth,async(req,res)=>{ if(!req.body.text) return res.status(400).json({message:'Message text is required'}); const message=await Message.create({sender:req.user._id,receiver:req.params.receiverId,text:req.body.text}); res.status(201).json({message:await message.populate([{path:'sender',select:'name photo'},{path:'receiver',select:'name photo'}])}); });
export default router;
