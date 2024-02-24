import mongoose, {model, Schema, models} from "mongoose";

const ProductSchema = new Schema({
  title: {type:String, required:true},
  description: {type:Object},
  price: {type: Number, required: true},
  tags: [String],
  images: [{type:String}],
  category: {type:mongoose.Types.ObjectId, ref:'Category'},
  selectProperties: [{type:Object}],
  inputProperties: [{type:Object}],
  stock: {type:Number},
  amountSold: {type:Number},
  eFile: [{type:String}],
  eTestFile: [{type:String}],
  isOnlyElectronic: {type:Boolean, default:false},
  electronicId: {type:String},
  authorId: {type:String},
  profileId: {type:mongoose.Types.ObjectId, ref:'ShipmentProfile'},
}, {
  timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);