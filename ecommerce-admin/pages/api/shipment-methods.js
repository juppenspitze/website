import {mongooseConnect} from "@/lib/mongoose";
import { ShipmentMethod } from "@/models/ShipmentMethod";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await ShipmentMethod.findOne({_id:req.query.id}));
    } else if (req.query?.countryId) {
      res.json(await ShipmentMethod.countDocuments({ 'countries.countryId': req.query.countryId }));
    } else if (req.query?.profileId) {
      res.json(await ShipmentMethod.countDocuments({ 'profiles.profileId': req.query.profileId }));
    }else {
      res.json(await ShipmentMethod.find());
    }
  }

  if (method === 'POST') {
    const {name,description,countries,profiles} = req.body;
    const ShipmentMethodDoc = await ShipmentMethod.create({
      name,description,countries,profiles
    })
    res.json(ShipmentMethodDoc);
  }

  if (method === 'PUT') {
    const {_id,name,description,countries,profiles} = req.body;
    await ShipmentMethod.updateOne({_id}, {name,description,countries,profiles});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await ShipmentMethod.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}