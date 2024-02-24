import {model, models, Schema} from "mongoose";

const adminSchema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String},
  normalPassword: {type: String},
}, {timestamps: true});

export const Admin = models?.Admin || model('Admin', adminSchema);