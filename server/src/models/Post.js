import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({ author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, text:{type:String,required:true,trim:true}, image:{type:String,default:''}, place:{type:String,default:''}, likes:{type:Number,default:0} },{timestamps:true});
export const Post = mongoose.model('Post', postSchema);
