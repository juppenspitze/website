import mongoose, {model, models, Schema} from "mongoose";

const CategorySchema = new Schema({
  name: {type:String,required:true},
  parent: {type:mongoose.Types.ObjectId, ref:'Category'},
  isDeprecated: {type:Boolean, default:false},
  selectProperties: [{type:Object}],
  inputProperties: [{type:Object}],
  vatPercentages: [{
    country: {type:mongoose.Types.ObjectId, ref:'Country'},
    percentage: {type:Number, required:true}
  }]
});

export const Category = models?.Category || model('Category', CategorySchema);