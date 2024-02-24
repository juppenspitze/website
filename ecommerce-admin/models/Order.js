import {model, models, Schema} from "mongoose";

const OrderSchema = new Schema({
  orderNo: {type: String, unique: true},
  userEmail: String,
  line_items:Object,
  shipmentMethodId: {type: Schema.Types.ObjectId, ref: 'ShipmentMethod'},
  profileId: {type: Schema.Types.ObjectId, ref: 'ShipmentProfile'},
  name:String,
  email:String,
  city: String,
  billCity: String,
  postalCode: String,
  billPostalCode: String,
  streetAddress: String,
  billStreetAddress: String,
  countryId: {type:Schema.Types.ObjectId, ref:'Country'},
  billCountry: String,
  isBillAddress: Boolean,
  shipmentFee: Number,
  paid:Boolean,
  state:String,
  vatFee:Number,
  paymentBrand:String,
  paymentLast4:String,
}, {
  timestamps: true,
});

export const Order = models?.Order || model('Order', OrderSchema);