import {mongooseConnect} from "@/lib/mongoose";
import {Product} from "@/models/Product";
import ProductsGrid from "@/components/Products/ProductsGrid";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {WishedProduct} from "@/models/WishedProduct";
import Layout from "@/components/Globals/Layout";
import { useTranslations } from "next-intl";

export default function Products({products,wishedProducts}) {
  const tProducts = useTranslations('Products');
  return (
    <>
      <Layout>
        <h2 className="text-2xl">{tProducts('all_products')}</h2>
        <ProductsGrid products={products} wishedProducts={wishedProducts} />
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const products = await Product.find({}, null, {sort:{'_id':-1}});
  const wishedProducts = session?.user
      ? await WishedProduct.find({
          userEmail:session?.user.email,
          product: products.map(p => p._id.toString()),
        })
      : [];
  return {
    props:{
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map(i => i.product.toString()),
    }
  };
}