import {model, models, Schema} from "mongoose";

const ShipmentProfileSchema = new Schema({
  profileName: {type: String},
  profileDescription: {type: String},
  isDeprecated: {type:Boolean,default:false},
  sizeIndex: {type: Number},
  
  minWeight: {type: Number},
  maxWeight: {type: Number},

  minHeight: {type: Number},
  maxHeight: {type: Number},

  minWidth: {type: Number},
  maxWidth: {type: Number},

  minDepth: {type: Number},
  maxDepth: {type: Number},
}, {timestamps: true});

export const ShipmentProfile = models?.ShipmentProfile || model('ShipmentProfile', ShipmentProfileSchema);