import {mongooseConnect} from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export default async function handle(req,res) {
  await mongooseConnect();
  const {phrase} = req.query;
  const {_id} = req.query;

  const categoriesQuery = {};
  if (phrase) {
    categoriesQuery['$or'] = [
      {name:{$regex:phrase,$options:'i'}},
    ];
    res.json(await Category.find(categoriesQuery));
  };

  if (_id) {
    const category = await Category.findById(_id);
    const subCategories = await Category.find({parent:category._id});
    const catIds = [category._id, ...subCategories.map(c => c._id)];
    const products = await Product.find({category:catIds});
    return res.json({
      category: JSON.parse(JSON.stringify(category)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      products: JSON.parse(JSON.stringify(products)),
    });
  };

  res.json(await Category.find());
}