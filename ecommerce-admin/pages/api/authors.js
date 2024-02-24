import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import { Author } from "@/models/Author";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);
  console.log(req)

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await Author.findOne({_id:req.query.id}));
    } else {
      res.json(await Author.find());
    }
  }

  if (method === 'POST') {
    const {authorName,description,image} = req.body;
    const authorDoc = await Author.create({
      authorName,description,image
    })
    res.json(authorDoc);
  }

  if (method === 'PUT') {
    const {authorName,description,image,isDeprecated,_id} = req.body;
    await Author.updateOne({_id}, {authorName,description,image,isDeprecated});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await Author.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}