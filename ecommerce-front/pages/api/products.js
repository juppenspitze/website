import {mongooseConnect} from "@/lib/mongoose";
import {Product} from "@/models/Product";

export default async function handle(req, res) {
  await mongooseConnect();
  const {categories, sort, phrase, tags, ...filters} = req.query;
  let [sortField, sortOrder] = (sort || '_id-desc').split('-');

  const productsQuery = {};
  if (categories) {
    productsQuery.category = categories.split(',');
  };
  if (phrase) {
    productsQuery['$or'] = [
      {title:{$regex:phrase,$options:'i'}},
      {description:{$regex:phrase,$options:'i'}},
      {tags: {$regex: phrase,$options:'i'}},
    ];
  };
  if (tags) {
    productsQuery['tags'] = {$in:tags.split(',')};
  };
  if (Object.keys(filters).length > 0) {
    Object.keys(filters).forEach(filterName => {
      productsQuery['selectProperties.'+filterName] = filters[filterName];
    });
  };
  res.json(await Product.find(
    productsQuery,
    null,
    {
      sort:{[sortField]:sortOrder==='asc' ? 1 : -1},
      limit:10
    })
  );
  };