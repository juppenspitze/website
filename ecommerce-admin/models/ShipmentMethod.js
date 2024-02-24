import {model, models, Schema} from "mongoose";

const ShipmentMethodSchema = new Schema({
  name: {type: String},
  description: {type: Object},
  countries: [{
    countryId: {type: Schema.Types.ObjectId, ref: 'Country'},
    baseFee: {type: Number},
  }],
  profiles: [{
    profileId: {type: Schema.Types.ObjectId, ref: 'ShipmentProfile'},
    profileFee: {type: Number},
    _id: {type: String}, //dunno why but doesnt work without this
  }],

}, {timestamps: true});

export const ShipmentMethod = models?.ShipmentMethod || model('ShipmentMethod', ShipmentMethodSchema);