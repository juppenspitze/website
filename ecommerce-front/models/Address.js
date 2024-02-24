import mongoose, {model, models, Schema} from "mongoose";

const AddressSchema = new Schema({
  userEmail: {type:String, unique:true, required:true},
  name: String,
  email: String,
  city: String,
  billCity: String,
  postalCode: String,
  billPostalCode: String,
  streetAddress: String,
  billStreetAddress: String,
  countryId: {type:Schema.Types.ObjectId, ref:'Country'},
  billCountry: String,
  isBillAddress: Boolean
});

export const Address = models?.Address || model('Address', AddressSchema);