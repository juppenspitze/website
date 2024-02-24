import {mongooseConnect} from "@/lib/mongoose";
import { ShipmentProfile } from "@/models/ShipmentProfile";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await ShipmentProfile.findOne({_id:req.query.id}));
    } else {
      res.json(await ShipmentProfile.find());
    }
  }

  if (method === 'POST') {
    const {profileName,sizeIndex,profileDescription,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth} = req.body;
    const ShipmentProfileDoc = await ShipmentProfile.create({
      profileName,sizeIndex,profileDescription,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth
    })
    res.json(ShipmentProfileDoc);
  }

  if (method === 'PUT') {
    const {_id,profileName,isDeprecated,sizeIndex,profileDescription,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth} = req.body;
    await ShipmentProfile.updateOne({_id}, {profileName,isDeprecated,sizeIndex,profileDescription,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await ShipmentProfile.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}