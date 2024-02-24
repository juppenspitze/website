import {mongooseConnect} from "@/lib/mongoose";
import {Product} from "@/models/Product";
import ProductImages from "@/components/Products/ProductImages";
import AddProdButton from "@/components/Globals/AddProdButton";
import ProductReviews from "@/components/Products/ProductReviews";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import Layout from "@/components/Globals/Layout";
import ProductSlider from "@/components/Products/ProductSlider";
import { WishedProduct } from "@/models/WishedProduct";
import { Author } from "@/models/Author";
import BackButton from "@/components/Globals/BackButton";
import { currencyForm } from "@/lib/handlers";
import Link from "next/link";
import { useEffect,useState } from "react";
import axios from "axios";
import parse from 'html-react-parser';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

export default function ProductPage({author,sameAuthorProducts,sameCategoryProducts,product,user,wishedProducts}) {
  const tSignleProductPage = useTranslations('Products.SingleProduct');
  const tSingleProductButtons = useTranslations('Buttons');
  const {locale} = useRouter();

  const [sameTagAndCategoryProducts, setSameTagAndCategoryProducts] = useState({});
  useEffect(() => {
    getSameTagAndCategoryProducts();
  }, [product]);

  async function getSameTagAndCategoryProducts() {
    const res = await axios.get(`/api/products?tags=${product.tags}`);
    let sameTagAndCategoryProducts = [];
    res.data = res.data.filter(p => p._id !== product._id);
    sameAuthorProducts.forEach(p => {
      res.data = res.data.filter(p2 => p2._id !== p._id);
    });
    sameCategoryProducts.forEach(p => {
      res.data = res.data.filter(p2 => p2._id !== p._id);
    });
    sameTagAndCategoryProducts.push(...res.data);
    sameTagAndCategoryProducts.push(...sameCategoryProducts);
    setSameTagAndCategoryProducts(sameTagAndCategoryProducts);
  };
  return (
    <>
      <Layout>
        <BackButton />
        <div className="flex max-sm:flex-col-reverse gap-10 mt-4 mb-10">
          <div className="flex flex-col max-sm:w-full w-[calc(58.33333%-2.5rem)] gap-2 h-full mb-auto">
            <div>
              <div className="text-2xl font-semibold">{product.title}</div>
              <div className="text-sm text-gray-500">{tSignleProductPage('by')} <Link className='underline underline-offset-2' href={`/authors/${author._id}`}>{author.authorName}</Link></div>
            </div>
            {parse(product.description?.[locale] || product.description?.['en'] || '')}
            <div className='mt-3 text-gray-500 font-light text-lg mb-[-10px]'>{tSignleProductPage('specs')}</div>
            <div className='flex flex-wrap sm:gap-2 [&>div]:flex-[0_0_33.33333%] max-sm:[&>div]:flex-[0_0_50%] text-sm'>
              {Object.keys(product.inputProperties[0]).map((key, i) => (
                <div key={i}>
                  <div className="font-semibold mt-1">{key}</div> 
                  {product.inputProperties[0][key]}
                </div>
              ))}
              {Object.keys(product.selectProperties[0]).map((key, i) => (
                <div key={i}>
                  <div className="font-semibold mt-1">{key}</div> 
                  {product.selectProperties[0][key]}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1 max-sm:w-full w-[calc(41.66666%-2.5rem)] bg-white rounded-lg">
            <ProductImages images={product.images} />
            <div className="flex flex-col gap-1 items-center w-full mt-5">
              {product.isOnlyElectronic && (<div className='text-sm text-muted-foreground'>{tSignleProductPage('only_electronic')}</div>)}
              {product.eFile[0] && product.electronicId && (
                <AddProdButton isDisabled={product.stock < 1} _id={product.electronicId} title={`${product.title} (${product.eFile[0].split('.').pop()})`} src={product.images?.[0]}
                  className='flex justify-between max-w-[300px] w-full uppercase max-sm:px-5 max-sm:py-3 max-sm:h-10 px-4 py-2 rounded-full border-gray-800 bg-[#ddc155]' variant="outline">
                  <span>{tSingleProductButtons('add_to_cart_ext', {extension: product.eFile[0].split('.').pop()})}</span>
                  <span>{currencyForm(product.price)}</span>
                </AddProdButton>)}
              {!product.isOnlyElectronic && (
                <AddProdButton isDisabled={product.stock < 1} _id={product._id} title={product.title} src={product.images?.[0]}
                    className='flex justify-between max-w-[300px] w-full uppercase max-sm:px-5 max-sm:py-3 max-sm:h-10 px-4 py-2 rounded-full border-gray-800 bg-[#ddc155]' variant="outline">
                  {product.stock < 1 ? tSignleProductPage('out_of_stock') : (<>
                    <span>{tSingleProductButtons('add_to_cart')}</span>
                    <span>{currencyForm(product.price)}</span>
                  </>)}
                </AddProdButton>
              )}

              {product.eTestFile?.length > 0 && (
                <a href={product.eTestFile[0]} download="file.pdf" className='w-full max-w-[300px]'>
                  <Button className='flex justify-between max-w-[300px] h-9 w-full max-sm:px-5 max-sm:py-3 max-sm:h-10 px-4 py-2 uppercase rounded-full border-gray-800 bg-[#d5d2c8]' variant="outline">
                    <span>{tSingleProductButtons('download_sample')}</span>
                  </Button>
                </a>
              )}
  
              {product.stock < 30 && product.stock > 0 && !product.isOnlyElectronic && (<div className='text-sm text-muted-foreground'>{tSignleProductPage('only_left_in_stock', {left: product.stock})}</div>)}
            </div>
          </div>
        </div>
        <ProductReviews product={product} user={user} />
        {sameAuthorProducts.length > 0 && (<>
          <div className="font-semibold">{tSignleProductPage('also_from_author', {author: author.name})}</div>
          <ProductSlider products={sameAuthorProducts} wishedProducts={wishedProducts} />
        </>)}
        {sameTagAndCategoryProducts.length > 0 && (<>
          <div className="font-semibold">{tSignleProductPage('similar_products')}</div>
          <ProductSlider products={sameTagAndCategoryProducts} wishedProducts={wishedProducts} />
        </>)}
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  await mongooseConnect();
  const session = await getServerSession(context.req, context.res, authOptions);
  let user = null;
  if (session?.user) { user = session.user; }

  const {id} = context.query;
  const product = await Product.findById(id);

  const author = await Author.findOne({_id: product.authorId});
  let sameAuthorProducts = await Product.find({authorId: product.authorId}, null, {sort: {'amountSold':-1}, limit:10});
  sameAuthorProducts = sameAuthorProducts.filter(p => p._id.toString() !== product._id.toString());

  let sameCategoryProducts = await Product.find({category: [product.category.toString()]}, null, {sort: {'amountSold':-1}, limit:10});
  sameCategoryProducts = sameCategoryProducts.filter(p => p._id.toString() !== product._id.toString());

  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail:session?.user.email,
        product: sameAuthorProducts.map(p => p._id.toString()),
      })
    : [];
  return {
    props: {
      messages: (await import(`@/locales/${context.locale}.json`)).default,
      author: JSON.parse(JSON.stringify(author)),
      sameAuthorProducts: JSON.parse(JSON.stringify(sameAuthorProducts)),
      sameCategoryProducts: JSON.parse(JSON.stringify(sameCategoryProducts)),
      product: JSON.parse(JSON.stringify(product)),
      user: JSON.parse(JSON.stringify(user)),
      wishedProducts: wishedProducts.map(i => i.product.toString()),
    }
  }
}