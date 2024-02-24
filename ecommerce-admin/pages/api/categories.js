import {Category} from "@/models/Category";
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === 'GET') {
    if (req.query?.categoryId) {
      res.json(await Category.countDocuments({parent:req.query.categoryId}));
    } else {
      res.json(await Category.find().populate('parent'));
    };
  }

  if (method === 'POST') {
    const {name,parentCategory,selectProperties,inputProperties,vatPercentages} = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      selectProperties,inputProperties,vatPercentages
    });
    res.json(categoryDoc);
  }

  if (method === 'PUT') {

    if (req.body?.categoriesToSave) {
      const {categoriesToSave} = req.body;
      const categoriesDoc = [];
      for (const category of categoriesToSave) {
        categoriesDoc.push(await Category.updateOne({ _id: category._id }, { $set: { vatPercentages: category.vatPercentages } }));
      };
      res.json(categoriesDoc);
    }

    const {name,parentCategory,selectProperties,inputProperties,isDeprecated,vatPercentages,_id} = req.body;
    const categoryDoc = await Category.updateOne({_id},{
      name,
      parent: parentCategory || undefined,
      selectProperties,inputProperties,isDeprecated,vatPercentages
    });
    res.json(categoryDoc);
  }

  if (method === 'DELETE') {
    const {_id} = req.query;
    await Category.deleteOne({_id});
    res.json('ok');
  }
}