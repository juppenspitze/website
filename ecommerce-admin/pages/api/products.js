import {Product} from "@/models/Product";
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const {method} = req;
  await mongooseConnect();
  await isAdminRequest(req,res);
  console.log(req)

  if (method === 'GET') {
    console.log(req.query)
    if (req.query?.id) {
      res.json(await Product.findOne({_id:req.query.id}));
    } else if (req.query?.categoryId) {
      res.json(await Product.countDocuments({category:req.query.categoryId}));
    } else if (req.query?.authorId) {
      res.json(await Product.countDocuments({authorId:req.query.authorId}));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === 'POST') {
    const {title,description,price,tags,images,category,selectProperties,inputProperties,stock,eTestFile,eFile,isOnlyElectronic,electronicId,authorId,profileId,amountSold} = req.body;
    const productDoc = await Product.create({
      title,description,price,tags,images,category,selectProperties,inputProperties,stock,eTestFile,eFile,isOnlyElectronic,electronicId,authorId,profileId,amountSold
    })
    res.json(productDoc);
  }

  if (method === 'PUT') {
    const {title,description,price,tags,images,category,selectProperties,inputProperties,stock,eTestFile,eFile,isOnlyElectronic,electronicId,authorId,profileId,amountSold,_id} = req.body;
    await Product.updateOne({_id}, {title,description,price,tags,images,category,selectProperties,inputProperties,stock,eTestFile,eFile,isOnlyElectronic,electronicId,authorId,profileId,amountSold});
    res.json(true);
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await Product.deleteOne({_id:req.query?.id});
      res.json(true);
    }
  }
}