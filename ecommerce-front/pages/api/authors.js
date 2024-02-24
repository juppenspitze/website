import {mongooseConnect} from "@/lib/mongoose";
import { Author } from "@/models/Author";

export default async function handle(req, res) {
  await mongooseConnect();
  const {phrase} = req.query;

  const authorQuery = {};
  if (phrase) {
    authorQuery['$or'] = [
      {authorName:{$regex:phrase,$options:'i'}},
      {description:{$regex:phrase,$options:'i'}},
    ];
  };
  
  res.json(await Author.find(authorQuery));
};