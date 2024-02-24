import {model, models, Schema} from "mongoose";

const invoiceSchema = new Schema({
  invoiceNo: {type: Number, unique: true},
}, {timestamps: true});

invoiceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Invoice = models?.Invoice || model('Invoice', invoiceSchema);