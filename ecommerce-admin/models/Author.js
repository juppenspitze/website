import {model, models, Schema} from "mongoose";

const authorSchema = new Schema({
  authorName: {type: String},
  description: {type:Object},
  image: {type: String},
  isDeprecated: {type: Boolean, default: false},
}, {timestamps: true});

export const Author = models?.Author || model('Author', authorSchema);