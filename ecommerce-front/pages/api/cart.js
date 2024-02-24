import {mongooseConnect} from "@/lib/mongoose";
import { uuidv4Regex } from "@/lib/regex";
import { Address } from "@/models/Address";
import { Category } from "@/models/Category";
import {Product} from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handle(req,res) {
  await mongooseConnect();
  const ids = req.body.ids;
  let {countryId} = req.body;

  let electronicIds = [];
  let usualIds = [];

  ids.forEach(id => {
    if (uuidv4Regex.test(id)) {
      electronicIds.push(id);
    } else {
      usualIds.push(id);
    }
  });

  let electronicProducts = await Product.find({electronicId: {$in: electronicIds}});
  const usualProducts = await Product.find({_id: {$in: usualIds}});

  electronicProducts = electronicProducts.map(p => {
    p = p.toObject();
    p['eVersion'] = true;
    return p;
  });

  let allProducts = [...electronicProducts, ...usualProducts];

  let user;
  if (!countryId) {
    const data = await getServerSession(req, res, authOptions);
    user = data?.user
    if (!user) return res.json({allProducts, vatTotal:null, vatUniquePercentages:[]})
    const addressCountryData = await Address.findOne({userEmail:user.email}).select('countryId');
    countryId = addressCountryData?.countryId;
  };

  const categoryIds = allProducts.map(p => p.category);
  const uniqueCategories = [...new Set(categoryIds)];
  const categoryData = await Category.find({_id: {$in: uniqueCategories}});

  const vatUniquePercentages = [];
  categoryData.forEach(c => {
    c.vatPercentages.forEach(v => {
      if (v.country.toString() === countryId.toString()) vatUniquePercentages.push({category: c._id,categoryName: c.name, percentage:v.percentage});
    });
  });

  allProducts = allProducts.map(p => {
    if (p instanceof mongoose.Document) p = p.toObject();
    let vatPercentage = vatUniquePercentages.find(v => v.category?.toString() === p.category?.toString())?.percentage;
    p.vatPercentage = vatPercentage;
    return p;
  });

  res.json({allProducts, vatUniquePercentages});
}