import {mongooseConnect} from "@/lib/mongoose";
import { Country } from "@/models/Country";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await Country.findOne({_id:req.query.id}));
    } else {
      res.json(await Country.find());
    }
  }

  if (method === 'POST') {
    const {name} = req.body;
    const CountryDoc = await Country.create({
      name
    })
    res.json(CountryDoc);
  }

  if (method === 'PUT') {
    const {_id,name,isDeprecated} = req.body;
    await Country.updateOne({_id}, {name,isDeprecated});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await Country.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}