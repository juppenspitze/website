import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import { FeaturedProduct } from "@/models/FeaturedProduct";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req,res);
  const {method} = req;

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await FeaturedProduct.findOne({_id:req.query.id}));
    } else if (req.query?.existingId) {
      res.json(await FeaturedProduct.find({existingId:req.query.existingId}));
    } else {
      res.json(await FeaturedProduct.find());
    }
  }

  if (method === 'POST') {
    const {existingId,bgImage,featuredDescription,orderIndex} = req.body;
    const productDoc = await FeaturedProduct.create({
      existingId,bgImage,featuredDescription,orderIndex
    })
    res.json(productDoc);
  }

  if (method === 'PUT') {
    const {existingId,bgImage,featuredDescription,_id,orderIndex} = req.body;
    await FeaturedProduct.updateOne({_id}, {existingId,bgImage,featuredDescription,orderIndex});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await FeaturedProduct.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}