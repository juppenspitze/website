import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import ProductBox from "@/components/Products/ProductBox";
import Link from "next/link";
import {RevealWrapper} from "next-reveal";
import {mongooseConnect} from "@/lib/mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {WishedProduct} from "@/models/WishedProduct";
import Layout from "@/components/Globals/Layout";
import { useTranslations } from "next-intl";

export default function Categories({mainCategories,categoriesProducts,wishedProducts=[]}) {
  const tCategories = useTranslations('Categories');
  return (
    <>
      <Layout>
        {mainCategories.map(cat => (
          <div className="mb-10" key={cat._id}>
            <div className="flex items-center gap-2.5 mt-2.5 mb-0 ">
              <h2 className="my-2.5">{cat.name}</h2>
              <div>
                <Link className="inline-block text-[#555]" href={'/categories/'+cat._id}>{tCategories('show_all')}</Link>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-5">
              {categoriesProducts[cat._id].map((p,index) => (
                <RevealWrapper key={index} delay={index*50}>
                  <ProductBox {...p} wished={wishedProducts.includes(p._id)} />
                </RevealWrapper>
              ))}
              <RevealWrapper delay={categoriesProducts[cat._id].length*50}>
                <Link className="flex items-center justify-center h-[160px] px-5 rounded-lg text-[#555] bg-[#ddd]" href={'/categories/'+cat._id}>
                  {tCategories('show_all')} &rarr;
                </Link>
              </RevealWrapper>
            </div>
          </div>
        ))}
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const categories = await Category.find();
  const mainCategories = categories.filter(c => !c.parent);
  const categoriesProducts = {}; // catId => [products]
  const allFetchedProductsId = [];
  for (const mainCat of mainCategories) {
    const mainCatId = mainCat._id.toString();
    const childCatIds = categories
      .filter(c => c?.parent?.toString() === mainCatId)
      .map(c => c._id.toString());
    const categoriesIds = [mainCatId, ...childCatIds];
    const products = await Product.find({category: categoriesIds}, null, {limit:3,sort:{'_id':-1}});
    allFetchedProductsId.push(...products.map(p => p._id.toString()))
    categoriesProducts[mainCat._id] = products;
  }


  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
      userEmail:session?.user.email,
      product: allFetchedProductsId,
    })
    : [];

  return {
    props: {
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      mainCategories: JSON.parse(
        JSON.stringify(mainCategories)
      ),
      categoriesProducts: JSON.parse(JSON.stringify(categoriesProducts)),
      wishedProducts: wishedProducts.map(i => i.product.toString()),
    },
  };
}