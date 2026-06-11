import mongoose from 'mongoose';
const locationSchema = new mongoose.Schema({ country:{type:String,required:true,trim:true}, state:{type:String,required:true,trim:true}, district:{type:String,required:true,trim:true}, latitude:{type:Number,required:true}, longitude:{type:Number,required:true} },{_id:false});
const userSchema = new mongoose.Schema({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, password:{type:String,required:true,minlength:6}, photo:{type:String,default:''}, location:{type:locationSchema,required:true}, bio:{type:String,default:'RabtPoint user'} },{timestamps:true});
userSchema.index({ name:'text', 'location.country':'text', 'location.state':'text', 'location.district':'text' });
userSchema.methods.toPublicJSON = function(){ return { id:this._id, name:this.name, email:this.email, photo:this.photo, bio:this.bio, location:this.location, createdAt:this.createdAt }; };
export const User = mongoose.model('User', userSchema);
