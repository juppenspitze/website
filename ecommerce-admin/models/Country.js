import {model, models, Schema} from "mongoose";

const CountrySchema = new Schema({
  name: {type:String,required:true},
  isDeprecated: {type:Boolean,default:false}
});

export const Country = models?.Country || model('Country', CountrySchema);