import {mongooseConnect} from "@/lib/mongoose";
import {Order} from "@/models/Order";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req,res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === 'GET') {
    if (req.query?.phrase) {
      const {phrase} = req.query;
      const productsQuery = {};
      productsQuery['$or'] = [
        {name:{$regex:phrase,$options:'i'}},
        {userEmail:{$regex:phrase,$options:'i'}},
        {email:{$regex:phrase,$options:'i'}},
        {streetAddress:{$regex:phrase,$options:'i'}},
        {city:{$regex:phrase,$options:'i'}},
        {orderNo: {$regex: phrase,$options:'i'}},
      ];
      res.json(await Order.find(productsQuery).sort({createdAt:-1}));
    } else {
      res.json(await Order.find({state: { $ne: "pending" }}).sort({createdAt:-1}));
    }
  };

  if (method === 'PUT') {
    const {state,paid,_id} = req.body;
    await Order.updateOne({_id}, {state,paid});
    res.json(true);
  }
}