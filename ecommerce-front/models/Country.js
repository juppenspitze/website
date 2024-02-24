import {model, models, Schema} from "mongoose";

const CountrySchema = new Schema({
  name: {type:String,required:true},
});

export const Country = models?.Country || model('Country', CountrySchema);