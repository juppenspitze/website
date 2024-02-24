import {model, Schema, models} from "mongoose";

const FeaturedProductSchema = new Schema({
  existingId: {type:Object},
  bgImage: {type:String},
  featuredDescription: {type:Object},
  orderIndex: {type:Number},
}, {
  timestamps: true,
});

export const FeaturedProduct = models.FeaturedProduct || model('FeaturedProduct', FeaturedProductSchema);